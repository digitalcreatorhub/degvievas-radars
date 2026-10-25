"use strict";
/* MiniMap: a tiny slippy map. Web Mercator raster tiles (openstreetmap.org)
   plus HTML markers. Pan, inertia, wheel zoom, pinch zoom, double tap, animated flights.
   No dependencies. Exposes window.MiniMap. */
(function () {
  const TILE = 256, MINZ = 5, MAXZ = 18;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const mercX = (lng, z) => ((lng + 180) / 360) * TILE * 2 ** z;
  const mercY = (lat, z) => {
    const s = Math.sin((clamp(lat, -85.05, 85.05) * Math.PI) / 180);
    return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * TILE * 2 ** z;
  };
  const unX = (x, z) => (x / (TILE * 2 ** z)) * 360 - 180;
  const unY = (y, z) => {
    const n = Math.PI - (2 * Math.PI * y) / (TILE * 2 ** z);
    return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  };
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  class MiniMap {
    constructor(host, opts = {}) {
      this.host = host;
      host.classList.add("mm");
      host.style.touchAction = "none";
      this.tiles = document.createElement("div");
      this.tiles.className = "mm-tiles";
      this.marks = document.createElement("div");
      this.marks.className = "mm-marks";
      const attr = document.createElement("div");
      attr.className = "mm-attr";
      attr.textContent = "© OpenStreetMap contributors";
      host.append(this.tiles, this.marks, attr);
      this.lat = 56.95; this.lng = 24.1; this.z = 11;
      this.W = 0; this.H = 0;
      this.dark = true;
      host.classList.add("dark");
      this.imgs = new Map();
      this.markers = new Map();
      this.order = [];
      this.onPick = opts.onPick || (() => {});
      this.dragged = false;
      this._raf = 0;
      this._pendingFit = null;
      this._bind();
      this._measure();
      if (window.ResizeObserver) new ResizeObserver(() => { this._measure(); this.draw(); }).observe(host);
    }

    _measure() {
      const r = this.host.getBoundingClientRect();
      const changed = r.width !== this.W || r.height !== this.H;
      this.W = r.width; this.H = r.height;
      if (this.W && this._pendingFit) { const f = this._pendingFit; this._pendingFit = null; this.fit(...f); }
      return changed;
    }

    setDark(dark) {
      if (this.dark === dark) return;
      this.dark = dark;
      this.host.classList.toggle("dark", dark); // dark mode is a CSS filter on the same tiles
      this.draw();
    }

    draw() {
      if (this._raf) return;
      this._raf = requestAnimationFrame(() => { this._raf = 0; this._drawNow(); });
    }
    _drawNow() {
      if (!this.W || !this.H) { this._measure(); if (!this.W) return; }
      this._tiles();
      this._markers();
    }

    /* ---- tiles ---- */
    _tiles() {
      const { W, H, z } = this;
      const tz = clamp(Math.round(z), 1, 19);
      const sc = 2 ** (z - tz);
      const cx = mercX(this.lng, tz), cy = mercY(this.lat, tz);
      const hw = W / 2 / sc, hh = H / 2 / sc, n = 2 ** tz;
      const x0 = Math.floor((cx - hw) / TILE), x1 = Math.floor((cx + hw) / TILE);
      const y0 = Math.max(0, Math.floor((cy - hh) / TILE)), y1 = Math.min(n - 1, Math.floor((cy + hh) / TILE));
      const need = new Set();
      for (let x = x0; x <= x1; x++) {
        for (let y = y0; y <= y1; y++) {
          const wx = ((x % n) + n) % n;
          const key = `${tz}/${x}/${y}`;
          need.add(key);
          if (this.imgs.has(key)) continue;
          const img = new Image();
          img.alt = ""; img.draggable = false;
          img._tz = tz; img._x = x; img._y = y;
          img.onload = () => img.classList.add("ok");
          img.onerror = () => { img.remove(); this.imgs.delete(key); };
          img.src = `https://tile.openstreetmap.org/${tz}/${wx}/${y}.png`;
          this.tiles.appendChild(img);
          this.imgs.set(key, img);
        }
      }
      const cache = {};
      for (const img of this.imgs.values()) {
        const t = img._tz, s = 2 ** (z - t);
        const c = cache[t] || (cache[t] = [mercX(this.lng, t), mercY(this.lat, t)]);
        img.style.transform = `translate3d(${((img._x * TILE - c[0]) * s + W / 2).toFixed(2)}px,${((img._y * TILE - c[1]) * s + H / 2).toFixed(2)}px,0)`;
        const size = (TILE * s + 0.6).toFixed(2) + "px";
        img.style.width = size; img.style.height = size;
        img.style.zIndex = t;
      }
      this._need = need;
      clearTimeout(this._gc);
      this._gc = setTimeout(() => {
        for (const [k, img] of this.imgs) if (!this._need.has(k)) { img.remove(); this.imgs.delete(k); }
      }, 450);
    }

    /* ---- markers ---- */
    setMarkers(list) {
      const seen = new Set();
      for (const m of list) {
        seen.add(m.id);
        let e = this.markers.get(m.id);
        if (!e) {
          e = { id: m.id, el: document.createElement("div"), mode: null, shown: null, html: null };
          e.anchor = document.createElement("div");
          e.anchor.className = "anchor";
          e.el.appendChild(e.anchor);
          if (!m.noPick) e.el.addEventListener("click", (ev) => {
            ev.stopPropagation();
            if (this.dragged) return;
            if (ev.target.closest(".cl")) { this.flyTo(e.lat, e.lng, Math.min(this.z + 2, MAXZ), 0.5, 450); return; }
            this.onPick(e.id);
          });
          this.marks.appendChild(e.el);
          this.markers.set(m.id, e);
        }
        const cls = "mk" + (m.cls ? " " + m.cls : "");
        if (e.cls !== cls) { e.cls = cls; e.el.className = cls; }
        if (e.html !== m.html || e.dotHtml !== m.dotHtml) { e.html = m.html; e.dotHtml = m.dotHtml; e.mode = null; }
        e.lat = m.lat; e.lng = m.lng; e.prio = m.prio ?? 1e9; e.force = !!m.force; e.noCluster = !!m.noCluster;
      }
      for (const [id, e] of this.markers) if (!seen.has(id)) { e.el.remove(); this.markers.delete(id); }
      this.order = [...this.markers.values()].sort((a, b) => a.prio - b.prio);
      this.draw();
    }
    _markers() {
      const { W, H, z } = this;
      const cx = mercX(this.lng, z), cy = mercY(this.lat, z);
      const placed = [];
      for (const e of this.order) {
        const x = Math.round(mercX(e.lng, z) - cx + W / 2), y = Math.round(mercY(e.lat, z) - cy + H / 2);
        const vis = x > -50 && x < W + 50 && y > -20 && y < H + 70;
        e.n = 0;
        if (!vis) { if (e.shown !== false) { e.shown = false; e.el.style.display = "none"; } continue; }
        e.el.style.transform = `translate(${x}px,${y}px)`;
        let mode = "label", host = null;
        if (!e.force && e.dotHtml != null) {
          const bx = x - 31, by = y - 34;
          for (const p of placed) if (bx < p[2] && bx + 62 > p[0] && by < p[3] && by + 34 > p[1]) { host = p[4]; break; }
          if (host) mode = e.noCluster ? "dot" : "hidden";
          else placed.push([bx, by, bx + 62, by + 34, e]);
        } else {
          placed.push([x - 31, y - 34, x + 31, y, e]);
        }
        e._mode = mode;
        if (mode === "hidden") host.n++;
        const show = mode !== "hidden";
        if (show !== e.shown) { e.shown = show; e.el.style.display = show ? "" : "none"; }
      }
      for (const e of this.order) {
        if (!e.shown) { e.mode = null; continue; }
        const mode = e._mode, key = mode + ":" + e.n;
        if (key === e.mode) continue;
        e.mode = key;
        const badge = mode === "label" && e.n > 0 ? `<span class="cl" role="button" aria-label="+${e.n}">+${e.n}</span>` : "";
        e.anchor.innerHTML = (mode === "label" ? e.html : e.dotHtml) + badge;
        e.el.style.zIndex = mode === "label" ? (e.force ? 2000 : 1000 - Math.min(e.prio, 900)) : 1;
      }
    }

    /* ---- camera ---- */
    setView(lat, lng, z) {
      this._stop();
      this.lat = clamp(lat, -84, 84); this.lng = lng; this.z = clamp(z, MINZ, MAXZ);
      this.draw();
    }
    getView() { return { lat: this.lat, lng: this.lng, z: this.z }; }
    _geoAt(sx, sy) {
      const cx = mercX(this.lng, this.z), cy = mercY(this.lat, this.z);
      return { lng: unX(cx + sx - this.W / 2, this.z), lat: unY(cy + sy - this.H / 2, this.z) };
    }
    _zoomAt(z, sx, sy, geo) {
      this.z = clamp(z, MINZ, MAXZ);
      const ax = mercX(geo.lng, this.z), ay = mercY(geo.lat, this.z);
      this.lng = unX(ax - (sx - this.W / 2), this.z);
      this.lat = clamp(unY(ay - (sy - this.H / 2), this.z), -84, 84);
    }
    _panBy(dx, dy) {
      const z = this.z;
      this.lng = unX(mercX(this.lng, z) - dx, z);
      this.lat = clamp(unY(mercY(this.lat, z) - dy, z), -84, 84);
    }
    _stop() { if (this._anim) { cancelAnimationFrame(this._anim); this._anim = 0; } }

    animateTo(t, ms = 600) {
      this._stop();
      const from = { lat: this.lat, lng: this.lng, z: this.z };
      const to = { lat: t.lat ?? from.lat, lng: t.lng ?? from.lng, z: clamp(t.z ?? from.z, MINZ, MAXZ) };
      const fy = mercY(from.lat, 10), ty = mercY(to.lat, 10);
      const t0 = performance.now();
      const step = (now) => {
        const k = clamp((now - t0) / ms, 0, 1), e = ease(k);
        this.z = from.z + (to.z - from.z) * e;
        this.lng = from.lng + (to.lng - from.lng) * e;
        this.lat = unY(fy + (ty - fy) * e, 10);
        this._drawNow();
        this._anim = k < 1 ? requestAnimationFrame(step) : 0;
      };
      this._anim = requestAnimationFrame(step);
    }
    zoomBy(d) { this.animateTo({ z: this.z + d }, 260); }

    flyTo(lat, lng, z, yFrac = 0.5, ms = 650) {
      const zz = clamp(z ?? this.z, MINZ, MAXZ);
      const wy = mercY(lat, zz) + this.H * (0.5 - yFrac);
      this.animateTo({ lat: unY(wy, zz), lng, z: zz }, ms);
    }

    fit(points, opts = {}) {
      const pad = opts.padding ?? 48, maxZ = opts.maxZ ?? 15, animate = opts.animate ?? false;
      if (!points.length) return;
      if (!this.W) { this._pendingFit = [points, opts]; return; }
      let a = 90, b = -90, c = 180, d = -180;
      for (const p of points) { a = Math.min(a, p.lat); b = Math.max(b, p.lat); c = Math.min(c, p.lng); d = Math.max(d, p.lng); }
      let z = MINZ;
      for (let t = maxZ; t >= MINZ; t -= 0.25) {
        if (mercX(d, t) - mercX(c, t) <= this.W - 2 * pad && mercY(a, t) - mercY(b, t) <= this.H - 2 * pad) { z = t; break; }
      }
      const lat = unY((mercY(a, z) + mercY(b, z)) / 2, z), lng = (c + d) / 2;
      if (animate) this.animateTo({ lat, lng, z }, 700); else this.setView(lat, lng, z);
    }

    /* ---- gestures ---- */
    _bind() {
      const h = this.host, ptr = new Map();
      let vel = { x: 0, y: 0 }, last = 0, start = null, pinch = null;
      const rect = () => h.getBoundingClientRect();
      const dist = () => { const [a, b] = [...ptr.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
      const mid = () => { const [a, b] = [...ptr.values()]; return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; };
      h.addEventListener("pointerdown", (e) => {
        if (e.target.closest(".mm-ctl")) return;
        this._stop();
        ptr.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (ptr.size === 1) { start = { x: e.clientX, y: e.clientY }; this.dragged = false; vel = { x: 0, y: 0 }; last = performance.now(); }
        if (ptr.size === 2) {
          const r = rect(), m = mid();
          pinch = { d: dist(), z: this.z, geo: this._geoAt(m.x - r.left, m.y - r.top) };
          this.dragged = true;
        }
      });
      h.addEventListener("pointermove", (e) => {
        const p = ptr.get(e.pointerId);
        if (!p) return;
        const dx = e.clientX - p.x, dy = e.clientY - p.y;
        p.x = e.clientX; p.y = e.clientY;
        if (ptr.size === 1) {
          if (!this.dragged && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 6) return;
          if (!this.dragged) { this.dragged = true; try { h.setPointerCapture(e.pointerId); } catch { /* ignore */ } }
          const now = performance.now(), dt = Math.max(1, now - last);
          vel = { x: 0.8 * vel.x + 0.2 * ((dx / dt) * 16), y: 0.8 * vel.y + 0.2 * ((dy / dt) * 16) };
          last = now;
          this._panBy(dx, dy);
          this.draw();
        } else if (ptr.size === 2 && pinch) {
          const r = rect(), m = mid();
          this._zoomAt(pinch.z + Math.log2(dist() / pinch.d), m.x - r.left, m.y - r.top, pinch.geo);
          this.draw();
        }
      });
      const up = (e) => {
        if (!ptr.has(e.pointerId)) return;
        ptr.delete(e.pointerId);
        pinch = null;
        if (ptr.size === 0 && this.dragged && performance.now() - last < 80 && Math.hypot(vel.x, vel.y) > 1) {
          const glide = () => {
            vel.x *= 0.92; vel.y *= 0.92;
            if (Math.hypot(vel.x, vel.y) < 0.35) { this._anim = 0; return; }
            this._panBy(vel.x, vel.y);
            this._drawNow();
            this._anim = requestAnimationFrame(glide);
          };
          this._anim = requestAnimationFrame(glide);
        }
        setTimeout(() => { if (!ptr.size) this.dragged = false; }, 0);
      };
      h.addEventListener("pointerup", up);
      h.addEventListener("pointercancel", up);
      h.addEventListener("wheel", (e) => {
        e.preventDefault();
        this._stop();
        const r = rect(), sx = e.clientX - r.left, sy = e.clientY - r.top;
        this._zoomAt(this.z - e.deltaY * (e.ctrlKey ? 0.01 : 0.0025), sx, sy, this._geoAt(sx, sy));
        this.draw();
      }, { passive: false });
      h.addEventListener("dblclick", (e) => {
        if (e.target.closest(".mk, .mm-ctl")) return;
        const r = rect(), g = this._geoAt(e.clientX - r.left, e.clientY - r.top);
        this.flyTo(g.lat, g.lng, this.z + 1, 0.5, 300);
      });
    }
  }

  window.MiniMap = MiniMap;
})();
