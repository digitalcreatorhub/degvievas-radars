"use strict";
/* Insights tab: charts built from the same rows the price list uses.
   Loaded before app.js; everything here runs after app.js has defined state/rowsFor/t. */

const L = (ru, en) => (state.lang === "ru" ? ru : en);
// Latvian excise on fuel (EUR per litre). Temporarily cut for 1 Oct to 31 Dec 2026 (vid.gov.lv).
const EXCISE = { petrol: { now: 0.49, after: 0.555 }, diesel: { now: 0.33, after: 0.396 }, until: "2026-12-31" };
const VAT = 0.21;
const CHART_FMT = {
  trend: (v) => v.toFixed(3) + " €",
  oil: (v) => v.toFixed(2) + " $",
  cons: (v) => v.toFixed(1) + " " + (state.lang === "ru" ? "л/100" : "l/100"),
};

function exciseFor(fuel) {
  const k = fuel === "95" || fuel === "98" ? "petrol" : fuel === "diesel" || fuel === "dplus" ? "diesel" : null;
  if (!k) return null;
  return rigaToday() <= EXCISE.until ? EXCISE[k].now : EXCISE[k].after;
}
const median = (a) => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const avg = (a) => a.reduce((x, y) => x + y, 0) / (a.length || 1);

function brentPerLitre() {
  const o = state.oil;
  if (!o || !o.brent || !o.eurusd) return null;
  return o.brent.price / o.eurusd / 158.987;
}
function cheaperThanPct(row) {
  const pool = rowsFor({ scopeOnly: true, ignoreMode: true }).filter((r) => r.exact);
  if (pool.length < 3 || !row.exact) return null;
  return Math.round((100 * pool.filter((r) => r.price > row.price + 1e-9).length) / pool.length);
}

function insightCards(pool, all) {
  const prices = pool.map((r) => r.price);
  const lo = Math.min(...prices), hi = Math.max(...prices), md = median(prices), av = avg(prices);
  const spreadC = (hi - lo) * 100, tank = (hi - lo) * Math.max(0, +state.liters || 0);
  const below = pool.filter((r) => r.price < av - 1e-9).length;
  const byChain = new Map();
  for (const r of pool) { const a = byChain.get(r.st.chain) || []; a.push(r.price); byChain.set(r.st.chain, a); }
  const best = [...byChain.entries()].filter(([, a]) => a.length >= 2).map(([c, a]) => [c, avg(a)]).sort((a, b) => a[1] - b[1])[0];
  const chain = best ? state.data.chains[best[0]] : null;
  const exactNote = pool.length === all.length ? "" : ` · ${L("точных", "exact")} ${pool.length}`;
  return `<div class="ins-grid">
    <div class="ins" style="--i:0"><small>${L("Разброс цен", "Price spread")}</small><b>${roll(spreadC.toFixed(1), "ins1")}<em>${L("цента", "cents")}</em></b><span>${L("до", "up to")} ${tank.toFixed(2)} € ${L("на бак", "per tank of")} ${state.liters} ${L("л", "l")}</span></div>
    <div class="ins" style="--i:1"><small>${L("Медиана", "Median")}</small><b>${roll(md.toFixed(3), "ins2")}<em>€</em></b><span>${L("средняя", "average")} ${av.toFixed(3)} €${exactNote}</span></div>
    <div class="ins" style="--i:2"><small>${L("Дешевле средней", "Below average")}</small><b>${roll(String(below), "ins3")}<em>${L("из", "of")} ${pool.length}</em></b><span>${L("станций города", "stations in the city")}</span></div>
    <div class="ins" style="--i:3"><small>${L("Выгоднее сеть", "Best chain")}</small><b class="chain-b">${chain ? `<i class="dot" style="background:${esc(chain.color)}"></i>${esc(chain.name)}` : "—"}</b><span>${chain ? `${L("в среднем", "on average")} ${best[1].toFixed(3)} €` : L("мало данных", "not enough data")}</span></div>
  </div>`;
}

function swarmSection(pool, all) {
  const byChain = new Map();
  for (const r of all) { const a = byChain.get(r.st.chain) || []; a.push(r); byChain.set(r.st.chain, a); }
  const order = [...byChain.entries()].map(([c, a]) => [c, Math.min(...a.map((r) => r.price)), a.length]).sort((a, b) => a[1] - b[1] || b[2] - a[2]).slice(0, 8);
  const lanes = order.map(([c]) => ({ key: c, label: state.data.chains[c].name }));
  const dots = [];
  const best = pool[0];
  for (const [c] of order) {
    const groups = new Map();
    for (const r of byChain.get(c)) {
      const k = r.price.toFixed(3) + (r.exact ? "e" : "m");
      const g = groups.get(k) || { rows: [], price: r.price, exact: r.exact };
      g.rows.push(r); groups.set(k, g);
    }
    for (const g of groups.values()) {
      const n = g.rows.length, ch = state.data.chains[c];
      dots.push({
        lane: c, price: g.price, n, exact: g.exact, color: ch.color,
        best: best && g.rows.includes(best),
        tip: `${ch.name} · ${fmtPrice(g.price)} € · ${n > 1 ? `${n} ${L("станций", "stations")}` : g.rows[0].st.address}${g.exact ? "" : " · " + L("оценка", "estimate")}`,
      });
    }
  }
  const prices = all.map((r) => r.price);
  const lo = Math.min(...prices) - 0.004, hi = Math.max(...prices) + 0.004;
  return `<h2>${L("Где какие цены", "Where the prices sit")}</h2>
  <p class="sub">${L("Каждая точка: цена одной или нескольких станций сети. Закрашенные точные, пунктир оценка по минимуму сети. Нажмите на точку.", "Each dot is the price of one or more stations of a chain. Filled = exact, dashed = chain-minimum estimate. Tap a dot.")}</p>
  ${Charts.swarm({ lanes, dots, lo, hi, median: median(pool.map((r) => r.price)), medianLabel: L("медиана", "median") })}`;
}

function scatterSection(all) {
  if (!state.loc) {
    return `<h2>${L("Цена против расстояния", "Price versus distance")}</h2>
    <div class="cta"><p>${L("Определите место, и я покажу, насколько дешевле станции подальше и где лежит разумный компромисс.", "Share your location and I will show how much cheaper the farther stations are and where the sweet spot lies.")}</p>
    <button class="btn" data-act="near">${state.locating ? L("Определяю…", "Locating…") : L("Определить место", "Find me")}</button></div>`;
  }
  const rows = all.filter((r) => r.dist != null);
  const maxD = Math.max(5, Math.min(30, Math.ceil(Math.max(...rows.map((r) => r.dist)) / 5) * 5));
  let inView = rows.filter((r) => r.dist <= maxD);
  if (inView.filter((r) => r.exact).length >= 5) inView = inView.filter((r) => r.exact);
  if (inView.length < 2) return "";
  const prices = inView.map((r) => r.price);
  const exactSorted = inView.filter((r) => r.exact).sort((a, b) => a.price - b.price);
  const dots = inView.map((r) => {
    const ch = state.data.chains[r.st.chain];
    return { x: r.dist, y: r.price, color: ch.color, exact: r.exact, best: exactSorted[0] === r, tip: `${ch.name} · ${fmtPrice(r.price)} € · ${r.dist.toFixed(1)} ${L("км", "km")} · ${r.st.address}` };
  });
  const lo = Math.min(...prices) - 0.004, hi = Math.max(...prices) + 0.004;
  // How much do you save per extra km? Compare nearest exact price with the cheapest exact one.
  const nearest = [...inView].filter((r) => r.exact).sort((a, b) => a.dist - b.dist)[0];
  const cheapest = exactSorted[0];
  let verdict = "";
  if (nearest && cheapest && nearest !== cheapest) {
    const saving = (nearest.price - cheapest.price) * state.liters;
    const extraKm = Math.max(0, cheapest.dist - nearest.dist) * 2;
    const fuelCost = (extraKm * state.consumption) / 100 * cheapest.price;
    const net = saving - fuelCost;
    verdict = `<p class="verdict ${net > 0 ? "good" : "bad"}">${net > 0
      ? L(`Дальняя станция выгоднее: экономия ${saving.toFixed(2)} € за ${state.liters} л, дорога туда и обратно съест ${fuelCost.toFixed(2)} €, чистый плюс ${net.toFixed(2)} €.`, `The farther station wins: you save ${saving.toFixed(2)} € on ${state.liters} l, the round trip burns ${fuelCost.toFixed(2)} €, net gain ${net.toFixed(2)} €.`)
      : L(`Ближайшая точная станция выгоднее: разница ${saving.toFixed(2)} € не окупает дорогу (${fuelCost.toFixed(2)} €).`, `The nearest exact station wins: the ${saving.toFixed(2)} € difference does not pay for the drive (${fuelCost.toFixed(2)} €).`)}</p>`;
  }
  return `<h2>${L("Цена против расстояния", "Price versus distance")}</h2>
  <p class="sub">${L("Ступенчатая линия показывает самую низкую цену, которую можно получить, доехав до этого расстояния.", "The stepped line is the lowest price you can get when you drive up to that distance.")}</p>
  ${Charts.scatter({ dots, xmax: maxD, lo, hi, radius: state.radius, xlabel: L("км по дороге (оценка)", "road km (estimate)") })}${verdict}`;
}

function areaSection(pool) {
  const d = state.data;
  let items = [];
  let title = L("Рейтинг районов", "Area ranking");
  const areas = state.city !== "all" ? d.areas.filter((a) => a.city === state.city) : [];
  if (areas.length) {
    items = areas.map((a) => {
      const rs = pool.filter((r) => (r.st.areas || []).includes(a.slug));
      return rs.length ? { key: a.slug, label: a.name, min: Math.min(...rs.map((r) => r.price)), avg: avg(rs.map((r) => r.price)), n: rs.length, act: "goarea" } : null;
    }).filter(Boolean);
  } else {
    title = L("Рейтинг городов", "City ranking");
    const byCity = new Map();
    for (const st of d.stations) {
      const c = st.fuels[state.fuel];
      if (!c || !isExact(c, st, state.fuel)) continue;
      const a = byCity.get(st.city) || []; a.push(c.p - discOf(st.chain)); byCity.set(st.city, a);
    }
    items = [...byCity.entries()].map(([slug, a]) => ({ key: slug, label: (d.cities.find((c) => c.slug === slug) || { name: slug }).name, min: Math.min(...a), avg: avg(a), n: a.length, act: "gocity" }));
  }
  items.sort((a, b) => a.min - b.min).splice(12);
  if (items.length < 2) return "";
  const lo = items[0].min, hi = Math.max(...items.map((i) => i.min));
  const bars = items.map((it, i) => {
    const pct = 30 + (70 * (it.min - lo)) / (hi - lo || 1);
    const tick = clamp(30 + (70 * (it.avg - lo)) / (hi - lo || 1), 0, 100);
    return `<div class="bar area" style="--i:${i}">
      <button data-act="${it.act}" data-v="${esc(it.key)}"><span class="a-name">${esc(it.label)}</span></button>
      <div class="track"><div class="fill" style="width:${pct.toFixed(0)}%;background:var(--amber)"></div><i class="avg-tick" style="left:${tick.toFixed(0)}%" title="${L("средняя", "average")} ${it.avg.toFixed(3)}"></i></div>
      <div><em>${fmtPrice(it.min)}</em><small>${it.n} ${L("ст.", "st.")}</small></div>
    </div>`;
  }).join("");
  return `<h2>${title}</h2><p class="sub">${L("Самая низкая точная цена в районе. Чёрточка: средняя цена. Нажмите, чтобы открыть район.", "Lowest exact price in the area. Tick: average price. Tap to open the area.")}</p><div class="bars">${bars}</div>`;
}

function compositionSection(pool) {
  const top = pool[0];
  if (!top) return "";
  const p = top.base;
  const vat = p - p / (1 + VAT);
  const excise = exciseFor(state.fuel);
  const crude = excise != null ? brentPerLitre() : null;
  const parts = [{ v: vat, color: "#7aa2f7", label: L("НДС 21%", "VAT 21%") }];
  const exciseNet = excise != null ? excise : 0;
  if (excise != null) parts.push({ v: exciseNet, color: "#f5a524", label: L("Акциз", "Excise duty") });
  const net = p - vat - exciseNet;
  if (crude != null && crude < net) {
    parts.push({ v: crude, color: "#8d6e63", label: L("Сырая нефть (Brent)", "Crude oil (Brent)") });
    parts.push({ v: net - crude, color: "#5bc27a", label: L("Переработка, логистика, наценка", "Refining, logistics, margin") });
  } else parts.push({ v: net, color: "#5bc27a", label: L("Продукт, логистика, наценка", "Product, logistics, margin") });
  const legend = parts.map((x) => `<li><i style="background:${x.color}"></i><span>${esc(x.label)}</span><b>${(x.v * 100).toFixed(1)} ${L("ц", "¢")}</b><small>${Math.round((x.v / p) * 100)}%</small></li>`).join("");
  const until = excise != null && rigaToday() <= EXCISE.until
    ? `<p class="sub">${L("Акциз временно снижен до 31.12.2026 (бензин 0,490 €/л, дизель 0,330 €/л). Доля нефти приблизительная: Brent по курсу к евро, без учёта различий сортов.", "Excise is temporarily cut until 31 Dec 2026 (petrol 0.490 €/l, diesel 0.330 €/l). The crude share is approximate: Brent converted to euro, ignoring grade differences.")}</p>`
    : excise == null ? `<p class="sub">${L("Для газа акцизная составляющая здесь не считается.", "Excise is not broken out for gas fuels here.")}</p>` : "";
  return `<h2>${L("Из чего состоит цена литра", "What a litre of fuel is made of")}</h2>
  <p class="sub">${esc(state.data.chains[top.st.chain].name)}, ${esc(top.st.address)}</p>
  <div class="donut-row">${Charts.donut({ parts, center: fmtPrice(p), sub: "€/" + L("л", "l") })}<ul class="legend-list">${legend}</ul></div>${until}`;
}

function statsPool() {
  const all = rowsFor({ scopeOnly: true, ignoreMode: true });
  const exact = all.filter((r) => r.exact);
  return { all, pool: exact.length >= 3 ? exact : all };
}
function savingsOut(pool) {
  const prices = pool.map((r) => r.price);
  const lo = Math.min(...prices), hi = Math.max(...prices), av = avg(prices);
  const lit = Math.max(0, +state.liters || 0), fpm = state.fpm;
  const yearAvg = (av - lo) * lit * fpm * 12, yearMax = (hi - lo) * lit * fpm * 12;
  const w = (v) => clamp((v / (yearMax || 1)) * 100, 4, 100);
  return `<div class="save-big">${roll(yearAvg.toFixed(0), "save1")}<em>€</em><small>${L("в год против средней цены", "a year versus the average price")}</small></div>
    <div class="sv-bars">
      <div><span>${L("против средней", "vs average")}</span><div class="track"><div class="fill" style="width:${w(yearAvg).toFixed(0)}%;background:var(--good)"></div></div><b>${yearAvg.toFixed(0)} €</b></div>
      <div><span>${L("против самой дорогой", "vs the priciest")}</span><div class="track"><div class="fill" style="width:${w(yearMax).toFixed(0)}%;background:var(--amber)"></div></div><b>${yearMax.toFixed(0)} €</b></div>
    </div>`;
}
function savingsLabel() { return `${L("Заправок в месяц", "Fill-ups per month")}: <b>${state.fpm}</b> · ${state.liters} ${L("л", "l")}`; }
function savingsSection(pool) {
  if (pool.length < 3) return "";
  return `<h2>${L("Сколько можно сэкономить за год", "How much you can save in a year")}</h2>
  <div class="save-card"><div class="sv-out">${savingsOut(pool)}</div>
    <label class="field slider"><span class="sv-label">${savingsLabel()}</span>
      <input type="range" min="1" max="12" step="1" value="${state.fpm}" data-act="fpm" aria-label="${L("Заправок в месяц", "Fill-ups per month")}"></label>
  </div>`;
}
function updateSavings() {
  const out = document.querySelector(".sv-out");
  if (!out) return;
  const { pool } = statsPool();
  if (pool.length < 3) return;
  out.innerHTML = savingsOut(pool);
  out.querySelectorAll(".fill").forEach((f) => { f.style.animation = "none"; });
  document.querySelector(".sv-label").innerHTML = savingsLabel();
  settleRolls();
}

function trendSection() {
  const h = state.history;
  const days = h ? Object.keys(h.days).sort() : [];
  let pts = days.map((d) => ({ d, e: h.days[d]?.[state.city]?.[state.fuel] })).filter((x) => x.e);
  const range = state.trendRange;
  const chips = ["7", "30", "all"].map((r) => `<button class="chip" data-act="trange" data-v="${r}" aria-pressed="${range === r}">${r === "all" ? L("Всё", "All") : r + " " + L("дн.", "d")}</button>`).join("");
  if (pts.length < 2) return `<h2>${L("Динамика цен", "Price trend")}</h2><p class="sub">${t("trendWait")}</p>`;
  if (range !== "all") pts = pts.slice(-(+range));
  const labels = pts.map((p) => p.d.slice(8, 10) + "." + p.d.slice(5, 7));
  return `<h2>${L("Динамика цен", "Price trend")}</h2><div class="chips" style="margin:0 0 8px">${chips}</div>
  ${Charts.line({ id: "trend", labels, fmt: (v) => v.toFixed(3), hint: L("Проведите пальцем по графику, чтобы увидеть цены по дням.", "Drag across the chart to read the prices day by day."),
    series: [
      { key: "avg", name: L("средняя", "average"), color: "#9aa19c", vals: pts.map((p) => p.e.avg), dashed: true },
      { key: "min", name: L("минимум", "lowest"), color: "#f5a524", vals: pts.map((p) => p.e.min), area: true },
    ] })}`;
}

function oilSection() {
  const o = state.oil;
  if (!o || !o.brent || !o.brent.series || o.brent.series.length < 3) return "";
  const n = Math.min(o.brent.series.length, o.wti && o.wti.series ? o.wti.series.length : 1e9);
  const cut = (a) => a.slice(a.length - n);
  const labels = Array.from({ length: n }, (_, i) => `${L("точка", "point")} ${i + 1}/${n}`);
  const axis = labels.map((_, i) => (i === 0 ? L("раньше", "earlier") : i === n - 1 ? L("сейчас", "now") : ""));
  const eur = o.eurusd ? (o.brent.price / o.eurusd / 158.987).toFixed(3) : null;
  return `<h2>${L("Нефть", "Crude oil")}</h2>${eur ? `<p class="sub">Brent ≈ ${eur} €/${L("л", "l")} ${L("сырья", "of crude")}</p>` : ""}
  ${Charts.line({ id: "oil", labels, axis, fmt: (v) => v.toFixed(0), H: 140,
    series: [
      { key: "wti", name: "WTI", color: "#7aa2f7", vals: cut(o.wti.series), dashed: true },
      { key: "brent", name: "Brent", color: "#ee7458", vals: cut(o.brent.series), area: true },
    ] })}`;
}

function renderStats() {
  const { all, pool } = statsPool();
  if (!pool.length) return `${fuelTabs()}<div class="empty"><b>${t("emptyH")}</b>${t("emptyT")}</div>`;
  return `${fuelTabs()}
    <h2 style="margin-top:20px">${L("Аналитика", "Insights")}</h2>
    <p class="sub">${esc(state.city === "all" ? t("allCountry") : (state.data.cities.find((c) => c.slug === state.city) || { name: "" }).name)}, ${t("fuels")[state.fuel]}${state.area ? ", " + esc((state.data.areas.find((a) => a.slug === state.area) || { name: "" }).name) : ""}</p>
    ${insightCards(pool, all)}
    ${swarmSection(pool, all)}
    ${scatterSection(all)}
    ${areaSection(pool)}
    ${compositionSection(pool)}
    ${savingsSection(pool)}
    ${trendSection()}
    ${oilSection()}`;
}
