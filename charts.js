"use strict";
/* Charts: small dependency-free SVG/HTML chart helpers. Each function returns markup.
   Animations are driven by CSS (the .enter class on the page wrapper). window.Charts */
(function () {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /** "nice" ticks between lo and hi */
  function ticks(lo, hi, n = 4) {
    const span = hi - lo || 1;
    const raw = span / n;
    const mag = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) || raw;
    const out = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(6));
    return out;
  }

  /** Strip plot by lane. dots: {lane, price, n, exact, best, color, tip} */
  function swarm({ lanes, dots, lo, hi, median, fmt = (v) => v.toFixed(3), medianLabel = "" }) {
    const W = 340, labelW = 84, padR = 14, laneH = 30, top = 22, axisH = 24;
    const H = top + lanes.length * laneH + axisH;
    const x = (p) => labelW + ((p - lo) / (hi - lo || 1)) * (W - labelW - padR);
    const laneIndex = new Map(lanes.map((l, i) => [l.key, i]));
    let svg = `<svg class="chart swarm" viewBox="0 0 ${W} ${H}" role="img">`;
    for (const tk of ticks(lo, hi, 4)) {
      svg += `<line x1="${x(tk)}" x2="${x(tk)}" y1="${top - 6}" y2="${H - axisH + 2}" class="grid"/><text x="${x(tk)}" y="${H - 6}" text-anchor="middle">${tk.toFixed(2)}</text>`;
    }
    lanes.forEach((l, i) => {
      const y = top + i * laneH + laneH / 2;
      svg += `<line x1="${labelW}" x2="${W - padR}" y1="${y}" y2="${y}" class="lane"/><text x="${labelW - 8}" y="${y + 4}" text-anchor="end" class="ln-label">${esc(l.label)}</text>`;
    });
    if (median != null) {
      svg += `<line x1="${x(median)}" x2="${x(median)}" y1="${top - 8}" y2="${H - axisH + 2}" class="median"/><text x="${x(median)}" y="10" text-anchor="middle" class="median-t">${esc(medianLabel)} ${fmt(median)}</text>`;
    }
    dots.forEach((d, k) => {
      const i = laneIndex.get(d.lane);
      if (i == null) return;
      const y = top + i * laneH + laneH / 2;
      const r = 4.5 + Math.min(4, Math.sqrt(d.n || 1) - 1);
      const fill = d.exact ? d.color : "none";
      svg += `<g class="sd" style="--k:${Math.min(k, 40)}" data-tip="${esc(d.tip)}"><circle cx="${x(d.price).toFixed(1)}" cy="${y}" r="${r.toFixed(1)}" fill="${fill}" stroke="${d.color}" stroke-width="${d.exact ? 1.5 : 2}" ${d.exact ? "" : 'stroke-dasharray="3 2"'} fill-opacity=".9"/>`;
      if (d.n > 1 && r >= 6.5) svg += `<text x="${x(d.price).toFixed(1)}" y="${y + 3}" text-anchor="middle" class="cnt">${d.n}</text>`;
      if (d.best) svg += `<circle cx="${x(d.price).toFixed(1)}" cy="${y}" r="${(r + 4).toFixed(1)}" class="best-ring"/>`;
      svg += `</g>`;
    });
    return svg + `</svg>`;
  }

  /** Price vs distance. dots: {x(km), y(price), color, exact, best, tip}; frontier drawn automatically */
  function scatter({ dots, xmax, lo, hi, radius, xlabel = "km" }) {
    const W = 340, H = 220, pl = 44, pr = 12, pt = 12, pb = 30;
    const X = (v) => pl + (clamp(v, 0, xmax) / xmax) * (W - pl - pr);
    const Y = (v) => pt + ((hi - v) / (hi - lo || 1)) * (H - pt - pb);
    let svg = `<svg class="chart scatter" viewBox="0 0 ${W} ${H}" role="img">`;
    for (const tk of ticks(lo, hi, 4)) svg += `<line x1="${pl}" x2="${W - pr}" y1="${Y(tk)}" y2="${Y(tk)}" class="grid"/><text x="${pl - 6}" y="${Y(tk) + 4}" text-anchor="end">${tk.toFixed(2)}</text>`;
    for (const tk of ticks(0, xmax, 5)) svg += `<text x="${X(tk)}" y="${H - 10}" text-anchor="middle">${tk}</text>`;
    svg += `<text x="${W - pr}" y="${H - 1}" text-anchor="end" class="axis-t">${esc(xlabel)}</text>`;
    if (radius) svg += `<rect x="${pl}" y="${pt}" width="${X(radius) - pl}" height="${H - pt - pb}" class="band"/>`;
    const sorted = [...dots].filter((d) => d.exact).sort((a, b) => a.x - b.x || a.y - b.y);
    let best = Infinity;
    const front = [];
    for (const d of sorted) if (d.y < best - 1e-9) { best = d.y; front.push(d); }
    if (front.length > 1) {
      let p = `M${X(front[0].x).toFixed(1)},${Y(front[0].y).toFixed(1)}`;
      for (let i = 1; i < front.length; i++) p += ` H${X(front[i].x).toFixed(1)} V${Y(front[i].y).toFixed(1)}`;
      p += ` H${X(xmax).toFixed(1)}`;
      svg += `<path d="${p}" class="front ln" pathLength="1" fill="none"/>`;
    }
    dots.forEach((d, k) => {
      svg += `<g class="sd" style="--k:${Math.min(k, 40)}" data-tip="${esc(d.tip)}"><circle cx="${X(d.x).toFixed(1)}" cy="${Y(d.y).toFixed(1)}" r="${d.best ? 6 : 4.5}" fill="${d.exact ? d.color : "none"}" stroke="${d.color}" stroke-width="1.6" ${d.exact ? "" : 'stroke-dasharray="3 2"'} fill-opacity=".85"/>${d.best ? `<circle cx="${X(d.x).toFixed(1)}" cy="${Y(d.y).toFixed(1)}" r="11" class="best-ring"/>` : ""}</g>`;
    });
    return svg + `</svg>`;
  }

  /** Donut: parts {v, color, label, text}; center is HTML-safe text lines */
  function donut({ parts, center, sub }) {
    const total = parts.reduce((a, p) => a + p.v, 0) || 1;
    let acc = 0, segs = "";
    parts.forEach((p, i) => {
      const len = (p.v / total) * 100;
      segs += `<circle class="dseg" cx="60" cy="60" r="44" pathLength="100" fill="none" stroke="${p.color}" stroke-width="16" style="--len:${len.toFixed(2)};--i:${i}" stroke-dasharray="${Math.max(0, len - 0.6).toFixed(2)} 100" stroke-dashoffset="${(-acc).toFixed(2)}" transform="rotate(-90 60 60)"/>`;
      acc += len;
    });
    return `<svg class="chart donut" viewBox="0 0 120 120" role="img"><circle cx="60" cy="60" r="44" fill="none" class="donut-bg" stroke-width="16"/>${segs}
      <text x="60" y="60" text-anchor="middle" class="d-c">${esc(center)}</text><text x="60" y="75" text-anchor="middle" class="d-s">${esc(sub || "")}</text></svg>`;
  }

  /** Generic line chart with scrubbing. series: [{key,color,vals,dashed,area}], labels: x labels */
  function line({ series, labels, axis, fmt = (v) => v.toFixed(3), W = 340, H = 150, id = "ln", hint = "" }) {
    const pl = 8, pr = 8, pt = 14, pb = 22;
    const all = series.flatMap((s) => s.vals);
    let lo = Math.min(...all), hi = Math.max(...all);
    const pad = (hi - lo) * 0.12 || 0.005;
    lo -= pad; hi += pad;
    const n = labels.length;
    const X = (i) => pl + (n === 1 ? 0 : (i * (W - pl - pr)) / (n - 1));
    const Y = (v) => pt + ((hi - v) * (H - pt - pb)) / (hi - lo || 1);
    let svg = `<svg class="chart linec" viewBox="0 0 ${W} ${H}" role="img" data-scrub="${esc(JSON.stringify({ labels, series: series.map((s) => ({ key: s.key, color: s.color, vals: s.vals, name: s.name })), W, H, pl, pr, pt, pb, lo, hi }))}" data-fmt="${esc(id)}">
      <defs>${series.filter((s) => s.area).map((s) => `<linearGradient id="g-${id}-${s.key}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.color}" stop-opacity=".35"/><stop offset="1" stop-color="${s.color}" stop-opacity="0"/></linearGradient>`).join("")}</defs>`;
    for (const tk of ticks(lo, hi, 3)) svg += `<line x1="${pl}" x2="${W - pr}" y1="${Y(tk).toFixed(1)}" y2="${Y(tk).toFixed(1)}" class="grid"/><text x="${pl}" y="${(Y(tk) - 3).toFixed(1)}">${fmt(tk)}</text>`;
    const idxs = n <= 4 ? labels.map((_, i) => i) : [0, Math.round((n - 1) / 2), n - 1];
    for (const i of idxs) svg += `<text x="${X(i).toFixed(1)}" y="${H - 5}" text-anchor="${i === 0 ? "start" : i === n - 1 ? "end" : "middle"}">${esc((axis || labels)[i])}</text>`;
    for (const s of series) {
      const d = s.vals.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
      if (s.area && n > 1) svg += `<path class="area" d="${d} L${X(n - 1).toFixed(1)},${H - pb} L${X(0).toFixed(1)},${H - pb} Z" fill="url(#g-${id}-${s.key})"/>`;
      svg += `<path class="ln" pathLength="1" d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.dashed ? 2 : 3}" stroke-linejoin="round" stroke-linecap="round" ${s.dashed ? 'stroke-opacity=".7"' : ""}/>`;
      svg += `<circle class="end" cx="${X(n - 1).toFixed(1)}" cy="${Y(s.vals[n - 1]).toFixed(1)}" r="4.5" fill="${s.color}"/>`;
    }
    svg += `<g class="cross" style="display:none"><line y1="${pt}" y2="${H - pb}" /></g><rect class="scrub" x="0" y="0" width="${W}" height="${H}" fill="transparent"/></svg>`;
    return `<div class="chartwrap">${svg}<div class="tip" hidden></div></div>${hint ? `<p class="sub chart-hint">${esc(hint)}</p>` : ""}`;
  }

  /** attach pointer scrubbing to every .linec inside root */
  function bindScrub(root, fmts) {
    root.querySelectorAll("svg.linec").forEach((svg) => {
      let cfg;
      try { cfg = JSON.parse(svg.dataset.scrub); } catch { return; }
      const fmt = (fmts && fmts[svg.dataset.fmt]) || ((v) => v.toFixed(3));
      const wrap = svg.parentElement, tip = wrap.querySelector(".tip"), cross = svg.querySelector(".cross");
      const n = cfg.labels.length;
      const X = (i) => cfg.pl + (n === 1 ? 0 : (i * (cfg.W - cfg.pl - cfg.pr)) / (n - 1));
      const Y = (v) => cfg.pt + ((cfg.hi - v) * (cfg.H - cfg.pt - cfg.pb)) / (cfg.hi - cfg.lo || 1);
      const dots = cfg.series.map((s) => {
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("r", "5"); c.setAttribute("fill", s.color); c.setAttribute("stroke", "var(--bg)"); c.setAttribute("stroke-width", "2");
        cross.appendChild(c);
        return c;
      });
      const move = (ev) => {
        const r = svg.getBoundingClientRect();
        const px = ((ev.clientX - r.left) / r.width) * cfg.W;
        const i = clamp(Math.round(((px - cfg.pl) / (cfg.W - cfg.pl - cfg.pr)) * (n - 1)), 0, n - 1);
        cross.style.display = "";
        const cx = X(i);
        cross.querySelector("line").setAttribute("x1", cx); cross.querySelector("line").setAttribute("x2", cx);
        cfg.series.forEach((s, k) => { dots[k].setAttribute("cx", cx); dots[k].setAttribute("cy", Y(s.vals[i])); });
        tip.hidden = false;
        tip.innerHTML = `<b>${esc(cfg.labels[i])}</b>` + cfg.series.map((s) => `<span><i style="background:${s.color}"></i>${esc(s.name || "")} ${esc(fmt(s.vals[i]))}</span>`).join("");
        const left = clamp((cx / cfg.W) * r.width, 50, r.width - 50);
        tip.style.left = left + "px";
      };
      const leave = () => { cross.style.display = "none"; tip.hidden = true; };
      const zone = svg.querySelector(".scrub");
      zone.addEventListener("pointermove", move);
      zone.addEventListener("pointerdown", move);
      zone.addEventListener("pointerleave", leave);
      zone.addEventListener("pointerup", (e) => { if (e.pointerType !== "mouse") setTimeout(leave, 1400); });
      zone.style.touchAction = "pan-y";
    });
  }

  /** Vertical columns. items {label, v, tip} */
  function columns({ items, fmt = (v) => v.toFixed(0), color = "var(--amber)", W = 340, H = 150 }) {
    const pl = 8, pr = 8, pt = 22, pb = 24;
    const max = Math.max(...items.map((i) => i.v), 1e-9);
    const slot = (W - pl - pr) / items.length, bw = Math.min(38, slot * 0.62);
    let svg = `<svg class="chart cols" viewBox="0 0 ${W} ${H}" role="img"><line x1="${pl}" x2="${W - pr}" y1="${H - pb}" y2="${H - pb}" class="grid"/>`;
    items.forEach((it, i) => {
      const h = (it.v / max) * (H - pt - pb), x = pl + slot * i + (slot - bw) / 2, y = H - pb - h;
      svg += `<g class="col-b" style="--i:${i}" data-tip="${esc(it.tip || "")}"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(h, 1).toFixed(1)}" rx="5" fill="${color}"/><text x="${(x + bw / 2).toFixed(1)}" y="${(y - 5).toFixed(1)}" text-anchor="middle" class="val">${esc(fmt(it.v))}</text></g><text x="${(x + bw / 2).toFixed(1)}" y="${H - 8}" text-anchor="middle">${esc(it.label)}</text>`;
    });
    return svg + `</svg>`;
  }

  function sparkline(vals, up) {
    if (!vals || vals.length < 2) return "";
    const W = 100, H = 22, lo = Math.min(...vals), hi = Math.max(...vals);
    const d = vals.map((v, i) => `${i ? "L" : "M"}${((i * W) / (vals.length - 1)).toFixed(1)},${(H - 3 - ((v - lo) * (H - 6)) / (hi - lo || 1)).toFixed(1)}`).join(" ");
    return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path class="ln" pathLength="1" d="${d}" fill="none" stroke="${up ? "var(--bad)" : "var(--good)"}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
  }

  /** Thin percentile meter */
  function meter(pct, label) {
    return `<div class="meter" role="img" aria-label="${esc(label)}"><div class="m-track"><div class="m-fill" style="--w:${clamp(pct, 0, 100)}%"></div><i class="m-dot" style="--w:${clamp(pct, 0, 100)}%"></i></div><small>${esc(label)}</small></div>`;
  }

  window.Charts = { ticks, swarm, scatter, donut, line, bindScrub, columns, sparkline, meter };
})();
