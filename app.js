"use strict";
/* Degvielas Radars: reads data/*.json (written by scripts/scrape.py) and
   shows the cheapest fuel in Latvia. No build step, no dependencies. */

const I18N = {
  ru: {
    title: "Degvielas Radars",
    refresh: "Обновить",
    theme: "Сменить тему",
    updated: "Данные от",
    ago: "назад",
    staleData: "Данные устарели, обновление не прошло",
    city: "Город",
    allArea: "Весь город",
    exact: "Точные цены",
    all: "Все заправки",
    allCountry: "Вся Латвия",
    search: "Поиск по адресу или сети",
    fewExact: "Мало точных цен для этого топлива.",
    showAllStations: "Показать все заправки",
    allPrices: "Все цены",
    noMatch: "Ничего не найдено",
    cheapest: "Дешевле всего",
    network: "единая цена сети",
    station: "цена этой станции",
    min: "минимум сети, здесь может быть выше",
    minShort: "оценка: минимум сети",
    user: "от водителей",
    userOld: "от водителей, давно не обновлялась",
    maybeCheaper: "Возможно дешевле",
    show: "показать",
    waze: "Waze",
    gmaps: "Google Maps",
    navTo: "Навигатор",
    tank: "Заправка на полный бак",
    liters: "Литров",
    consumption: "Расход, л/100 км",
    road: "Считать дорогу до станции",
    roadHelp: "Расстояние по прямой × 1,3, туда и обратно.",
    nearMe: "Рядом со мной",
    locating: "Определяю место…",
    locFail: "Не удалось определить место. Разрешите доступ к геопозиции в браузере.",
    tankCost: "Бак",
    saveAvg: "Дешевле средней цены на",
    saveMax: "дешевле самой дорогой на",
    stationsH: "Станции",
    withPrice: "с ценой",
    showAll: "Показать все",
    showLess: "Свернуть",
    chainsH: "Сети",
    chainsSub: "Лучшая цена в каждой сети",
    trendH: "Динамика",
    trendSub: "Минимум и средняя цена по городу",
    trendWait: "График появится, когда накопится несколько дней данных.",
    min_s: "минимум",
    avg_s: "средняя",
    oilH: "Нефть",
    barrel: "за баррель",
    vsYest: "К вчерашнему дню",
    same: "без изменений",
    cents: "цента",
    emptyH: "Нет подходящих цен",
    emptyT: "Для этого топлива здесь нет точных цен. Покажите все заправки или выберите другой город.",
    noDataH: "Данные ещё не собраны",
    noDataT: "Первый сбор цен запускается автоматически, обычно это занимает пару минут. Обновите страницу позже.",
    km: "км",
    today: "сегодня",
    yesterday: "вчера",
    changed: "изменена",
    fuels: { "95": "95", "98": "98", diesel: "Дизель", dplus: "Дизель+", lpg: "Автогаз", cng: "Метан (CNG)" },
    source: "Источник цен: letadegviela.lv. Цены сетей публикуются по сети целиком, на конкретной станции они могут отличаться. Перед заправкой сверьтесь с табло.",
    install: "Установить",
    installText: "Откроется как обычное приложение, прямо с экрана телефона",
    installAndroid: "Откройте меню браузера (три точки) и выберите «Установить приложение»",
    installIos: "Нажмите «Поделиться», затем «На экран Домой»",
    later: "Позже",
    day: "дн.",
  },
  en: {
    title: "Degvielas Radars",
    refresh: "Refresh",
    theme: "Switch theme",
    updated: "Data from",
    ago: "ago",
    staleData: "Data is stale, the last refresh failed",
    city: "City",
    allArea: "Whole city",
    exact: "Exact prices",
    all: "All stations",
    allCountry: "All of Latvia",
    search: "Search by address or chain",
    fewExact: "Few exact prices for this fuel.",
    showAllStations: "Show all stations",
    allPrices: "All prices",
    noMatch: "Nothing found",
    cheapest: "Cheapest",
    network: "chain-wide price",
    station: "this station's price",
    min: "chain minimum, may be higher here",
    minShort: "estimate: chain minimum",
    user: "from drivers",
    userOld: "from drivers, not updated lately",
    maybeCheaper: "Possibly cheaper",
    show: "show",
    waze: "Waze",
    gmaps: "Google Maps",
    navTo: "Navigate",
    tank: "Full tank",
    liters: "Litres",
    consumption: "Consumption, l/100 km",
    road: "Count the drive to the station",
    roadHelp: "Straight-line distance × 1.3, round trip.",
    nearMe: "Near me",
    locating: "Finding your location…",
    locFail: "Could not get your location. Allow location access in the browser.",
    tankCost: "Tank",
    saveAvg: "Cheaper than the average price by",
    saveMax: "cheaper than the most expensive by",
    stationsH: "Stations",
    withPrice: "with a price",
    showAll: "Show all",
    showLess: "Show less",
    chainsH: "Chains",
    chainsSub: "Best price in each chain",
    trendH: "Trend",
    trendSub: "Lowest and average price in the city",
    trendWait: "The chart appears once a few days of data have been collected.",
    min_s: "lowest",
    avg_s: "average",
    oilH: "Crude oil",
    barrel: "per barrel",
    vsYest: "Versus yesterday",
    same: "no change",
    cents: "cents",
    emptyH: "No matching prices",
    emptyT: "There are no exact prices for this fuel here. Show all stations or pick another city.",
    noDataH: "No data yet",
    noDataT: "The first price collection starts automatically and takes a couple of minutes. Reload the page later.",
    km: "km",
    today: "today",
    yesterday: "yesterday",
    changed: "changed",
    fuels: { "95": "95", "98": "98", diesel: "Diesel", dplus: "Diesel+", lpg: "Autogas (LPG)", cng: "CNG" },
    source: "Price source: letadegviela.lv. Chains publish one price for the whole network, so a given station can differ. Check the pump display before filling.",
    install: "Install",
    installText: "Opens like a regular app, straight from your home screen",
    installAndroid: "Open the browser menu (three dots) and choose “Install app”",
    installIos: "Tap Share, then “Add to Home Screen”",
    later: "Later",
    day: "d",
  },
};
const FUEL_ORDER = ["95", "98", "diesel", "dplus", "lpg", "cng"];
const EXACT_KINDS = new Set(["station", "network", "user"]);
const USER_MAX_AGE_H = 72;
const USER_MAX_AGE_BY_FUEL = { lpg: 21 * 24, cng: 21 * 24 };
const ROAD_FACTOR = 1.3;
const STALE_AFTER_MIN = 20 * 60;

const store = {
  get(k, d) { try { const v = localStorage.getItem("dr." + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem("dr." + k, JSON.stringify(v)); } catch { /* private mode */ } },
};

const state = {
  theme: store.get("theme", "dark"),
  lang: store.get("lang", (navigator.language || "ru").startsWith("ru") ? "ru" : "en"),
  city: store.get("city", "riga"),
  area: null,
  chain: null,
  fuel: store.get("fuel", "95"),
  mode: store.get("mode", "exact"),
  liters: store.get("liters", 50),
  consumption: store.get("consumption", 7),
  road: false,
  showAll: false,
  q: "",
  open: null,
  loc: null,
  locStatus: "",
  loading: false,
  installed: false,
  data: null, history: null, oil: null,
};
let installPrompt = null;
const isStandalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const INSTALL_SNOOZE_MS = 3 * 864e5;

const t = (k) => I18N[state.lang][k];
function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = state.theme === "light" ? "#edefec" : "#16181a";
}
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- time (Latvia) ---------- */
function rigaParts(date) {
  const f = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Riga", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
  const o = {};
  for (const p of f.formatToParts(date)) o[p.type] = p.value;
  return o;
}
function rigaPseudoMs(date = new Date()) {
  const p = rigaParts(date);
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute);
}
function rigaToday() { const p = rigaParts(new Date()); return `${p.year}-${p.month}-${p.day}`; }
function ageHours(cell) {
  if (!cell.ch) return Infinity;
  return (rigaPseudoMs() - Date.parse(cell.ch + ":00Z")) / 3.6e6;
}
function relTime(iso) {
  const mins = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000));
  if (mins < 60) return `${mins} ${state.lang === "ru" ? "мин" : "min"}`;
  const h = Math.round(mins / 60);
  return h < 48 ? `${h} ${state.lang === "ru" ? "ч" : "h"}` : `${Math.round(h / 24)} ${t("day")}`;
}
function dayWord(cell) {
  if (!cell.ch) return "";
  const [d, tm] = cell.ch.split("T");
  const today = rigaToday();
  const y = new Date(Date.parse(today + "T00:00:00Z") - 864e5).toISOString().slice(0, 10);
  const when = d === today ? t("today") : d === y ? t("yesterday") : d.slice(8, 10) + "." + d.slice(5, 7);
  return `${t("changed")} ${when} ${tm}`;
}

/* ---------- prices ---------- */
function isExact(cell, st, fuel) {
  if (st.stale || !EXACT_KINDS.has(cell.k)) return false;
  return cell.k !== "user" || ageHours(cell) <= (USER_MAX_AGE_BY_FUEL[fuel] ?? USER_MAX_AGE_H);
}
function fmtPrice(p) { return p.toFixed(3); }
function pylon(p) { const s = fmtPrice(p); return `${s.slice(0, 4)}<sup>${s.slice(4)}</sup>`; }
function haversineKm(a, b) {
  const R = 6371, r = (x) => (x * Math.PI) / 180;
  const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function kindLabel(row) {
  if (row.cell.k === "user") return row.exact ? t("user") : t("userOld");
  return t(row.cell.k) || "";
}

function rowsFor(opts = {}) {
  const { ignoreChain = false, ignoreMode = false } = opts;
  const d = state.data;
  if (!d) return [];
  const rows = [];
  const query = state.q.trim().toLowerCase();
  for (const st of d.stations) {
    if (state.city !== "all" && st.city !== state.city) continue;
    if (state.area && !(st.areas || []).includes(state.area)) continue;
    if (!ignoreChain && state.chain && st.chain !== state.chain) continue;
    const cell = st.fuels[state.fuel];
    if (!cell) continue;
    const exact = isExact(cell, st, state.fuel);
    if (query && !(`${d.chains[st.chain].name} ${st.address}`.toLowerCase().includes(query))) continue;
    if (!ignoreMode && state.mode === "exact" && !exact) continue;
    const row = { st, cell, price: cell.p, exact, dist: null, total: null };
    if (state.loc) {
      row.dist = haversineKm(state.loc, st) * ROAD_FACTOR;
      const extraL = (2 * row.dist * state.consumption) / 100;
      row.total = cell.p * (state.liters + extraL);
    }
    rows.push(row);
  }
  const useTotal = state.road && state.loc;
  const outdated = (r) => (r.cell.k === "user" && !r.exact ? 1 : 0); // old driver prices go last
  rows.sort((a, b) =>
    outdated(a) - outdated(b) ||
    (useTotal ? a.total - b.total
      : a.price - b.price || (a.dist ?? 0) - (b.dist ?? 0) || (a.cell.ago ?? 9e9) - (b.cell.ago ?? 9e9)));
  return rows;
}

function historyDelta() {
  const h = state.history;
  if (!h) return null;
  const days = Object.keys(h.days).sort();
  if (days.length < 2) return null;
  const today = days[days.length - 1], prev = days[days.length - 2];
  const a = h.days[today]?.[state.city]?.[state.fuel];
  const b = h.days[prev]?.[state.city]?.[state.fuel];
  if (!a || !b) return null;
  return { now: a.min, prev: b.min, delta: a.min - b.min };
}

/* ---------- rendering ---------- */
const app = document.getElementById("app");

function linkWaze(st) { return `https://waze.com/ul?ll=${st.lat},${st.lng}&navigate=yes`; }
function linkGmaps(st) { return `https://www.google.com/maps/dir/?api=1&destination=${st.lat},${st.lng}`; }

function renderHeader() {
  const d = state.data;
  let meta = "";
  if (d) {
    const ageMin = Math.round((Date.now() - Date.parse(d.generated_at)) / 60000);
    const hhmm = new Intl.DateTimeFormat("ru-RU", { timeZone: "Europe/Riga", hour: "2-digit", minute: "2-digit" }).format(new Date(d.generated_at));
    meta = `${t("updated")} ${hhmm}, ${relTime(d.generated_at)} ${t("ago")}`;
    if (ageMin > STALE_AFTER_MIN) meta += ` <span class="stale">${t("staleData")}</span>`;
  }
  const cities = d ? d.cities : [];
  const areas = d && state.city !== "all" ? d.areas.filter((a) => a.city === state.city) : [];
  return `
  <header class="top"><div class="top-row">
    <h1 class="brand">Degvielas <span>Radars</span></h1>
    <button class="icon-btn" data-act="theme" aria-label="${t("theme")}" title="${t("theme")}">${state.theme === "light"
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'}</button>
    <button class="icon-btn" data-act="lang" aria-label="Language">${state.lang === "ru" ? "EN" : "RU"}</button>
    <button class="icon-btn" data-act="refresh" aria-label="${t("refresh")}" ${state.loading ? 'aria-busy="true"' : ""}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>
    </button>
  </div>
  <p class="meta">${meta || "&nbsp;"}</p>
  ${cities.length ? `<div class="picker">
    <select data-act="city" aria-label="${t("city")}"><option value="all" ${state.city === "all" ? "selected" : ""}>${t("allCountry")} (${d.stations.length})</option>${cities.map((c) => `<option value="${esc(c.slug)}" ${c.slug === state.city ? "selected" : ""}>${esc(c.name)} (${c.count})</option>`).join("")}</select>
    <button class="icon-btn" data-act="near" aria-label="${t("nearMe")}" title="${t("nearMe")}">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="8"/></svg>
      ${state.loc ? "" : `<span>${t("nearMe")}</span>`}
    </button>
  </div>` : ""}
  ${areas.length ? `<div class="chips" role="group">
    <button class="chip" data-act="area" data-v="" aria-pressed="${!state.area}">${t("allArea")}</button>
    ${areas.map((a) => `<button class="chip" data-act="area" data-v="${esc(a.slug)}" aria-pressed="${state.area === a.slug}">${esc(a.name)}<small>${a.count}</small></button>`).join("")}
  </div>` : ""}
  </header>`;
}

function renderInstall() {
  if (isStandalone() || state.installed) return "";
  const hiddenAt = store.get("installHidden", 0);
  if (Date.now() - hiddenAt < INSTALL_SNOOZE_MS) return "";
  const action = installPrompt
    ? `<button class="btn-install" data-act="install">${t("install")}</button>`
    : "";
  const text = installPrompt ? t("installText") : isIos() ? t("installIos") : t("installAndroid");
  return `<aside class="install" aria-label="${t("install")}">
    <p>${text}</p>
    ${action}
    <button class="install-later" data-act="later">${t("later")}</button>
  </aside>`;
}

function renderFuelTabs() {
  const present = new Set();
  if (state.data) for (const st of state.data.stations) if (state.city === "all" || st.city === state.city) for (const f in st.fuels) present.add(f);
  const fuels = FUEL_ORDER.filter((f) => present.has(f));
  if (fuels.length && !fuels.includes(state.fuel)) state.fuel = fuels[0];
  return `<div class="fuels" role="group">${fuels.map((f) => `<button class="fuel" data-act="fuel" data-v="${f}" aria-pressed="${state.fuel === f}">${t("fuels")[f]}</button>`).join("")}</div>
  <div class="seg" role="group">
    <button data-act="mode" data-v="exact" aria-pressed="${state.mode === "exact"}">${t("exact")}</button>
    <button data-act="mode" data-v="all" aria-pressed="${state.mode === "all"}">${t("all")}</button>
  </div>
  <div class="search"><input type="search" data-act="q" value="${esc(state.q)}" placeholder="${t("search")}" aria-label="${t("search")}" autocomplete="off"></div>`;
}

function renderPylon(rows) {
  if (!rows.length) {
    const body = state.q.trim() ? t("noMatch") : t("emptyT");
    const more = state.mode === "exact" ? `<p><button class="chip" data-act="mode" data-v="all">${t("showAllStations")}</button></p>` : "";
    return `<div class="empty"><b>${t("emptyH")}</b>${body}${more}</div>`;
  }
  const top = rows[0];
  const chain = state.data.chains[top.st.chain];
  const tagClass = top.exact ? "good" : "warn";
  const dl = historyDelta();
  let delta = "";
  if (dl && !state.area && !state.chain) {
    const c = Math.abs(dl.delta) * 100;
    delta = `<p class="delta">${t("vsYest")}: ` + (c < 0.05
      ? t("same")
      : `<span class="${dl.delta < 0 ? "down" : "up"}">${dl.delta < 0 ? "−" : "+"}${c.toFixed(1)} ${t("cents")}</span> (${fmtPrice(dl.prev)} €)`) + `</p>`;
  }
  let hint = "";
  if (state.mode === "exact") {
    const est = rowsFor({ ignoreMode: true }).find((r) => !r.exact && r.price < top.price);
    if (est) {
      hint = `<p class="hint">${t("maybeCheaper")}: ${esc(state.data.chains[est.st.chain].name)} ${fmtPrice(est.price)} €. <button data-act="mode" data-v="all">${t("show")}</button></p>`;
    }
  }
  if (!hint && state.mode === "exact" && rows.length < 5) {
    hint = `<p class="hint">${t("fewExact")} <button data-act="mode" data-v="all">${t("showAllStations")}</button></p>`;
  }
  const extra = top.dist != null ? `<br>${top.dist.toFixed(1)} ${t("km")}` : "";
  return `
  <section class="pylon" aria-label="${t("cheapest")}">
    <p class="where">${esc(chain.name)}</p>
    <p class="addr">${esc(top.st.address)}</p>
    <div class="price-line">
      <div class="pylon-price" aria-label="${fmtPrice(top.price)} €/L">${pylon(top.price)}</div>
      <div class="price-side"><b>€/L</b>${t("fuels")[state.fuel]}${extra}</div>
    </div>
    <span class="tag ${tagClass}">${kindLabel(top)}</span>
    ${top.cell.ch ? `<span class="tag">${dayWord(top.cell)}</span>` : ""}
    ${delta}
    <div class="actions">
      <a class="btn" href="${linkWaze(top.st)}" target="_blank" rel="noopener">${t("waze")}</a>
      <a class="btn ghost" href="${linkGmaps(top.st)}" target="_blank" rel="noopener">${t("gmaps")}</a>
    </div>
    ${hint}
  </section>`;
}

function renderCalc(rows) {
  if (!rows.length) return "";
  const best = rows[0];
  const prices = rows.map((r) => r.price);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const max = Math.max(...prices);
  const L = Math.max(0, +state.liters || 0);
  const useRoad = state.road && state.loc;
  const cost = useRoad ? best.total : best.price * L;
  const saveAvg = (avg - best.price) * L, saveMax = (max - best.price) * L;
  return `
  <h2>${t("tank")}</h2>
  <div class="calc">
    <div class="field"><label for="liters">${t("liters")}</label><input id="liters" type="number" inputmode="decimal" min="1" max="200" value="${esc(state.liters)}" data-act="liters"></div>
    ${state.loc ? `<div class="field"><label for="cons">${t("consumption")}</label><input id="cons" type="number" inputmode="decimal" min="1" max="40" step="0.5" value="${esc(state.consumption)}" data-act="cons"></div>` : ""}
    ${state.loc ? `<label class="toggle"><input type="checkbox" data-act="road" ${state.road ? "checked" : ""}><span>${t("road")}<br><small style="color:var(--mute)">${t("roadHelp")}</small></span></label>` : ""}
    <div class="sum"><strong>${t("tankCost")} ${cost.toFixed(2)} €</strong>
      <p class="save">${saveAvg >= 0.005 ? `${t("saveAvg")} ${saveAvg.toFixed(2)} €` : ""}${saveAvg >= 0.005 && saveMax >= 0.005 ? ", " : ""}${saveMax >= 0.005 ? `${t("saveMax")} ${saveMax.toFixed(2)} €` : ""}</p></div>
  </div>`;
}

function renderList(rows) {
  if (!rows.length) return "";
  const limit = state.showAll ? rows.length : 8;
  const items = rows.slice(0, limit).map((r, i) => {
    const chain = state.data.chains[r.st.chain];
    const note = !r.exact
      ? `<span class="note warn">${r.cell.k === "min" ? t("minShort") : kindLabel(r)}</span>`
      : r.cell.k === "user" ? `<span class="note">${kindLabel(r)}</span>` : "";
    const dist = r.dist != null ? `${r.dist.toFixed(1)} ${t("km")}, ` : "";
    return `<li class="row">
      <span class="rank">${i + 1}</span>
      <div class="who"><b><i class="dot" style="background:${esc(chain.color)}"></i>${esc(chain.name)}</b>
        <span>${esc(r.st.address)}</span>${note}
        <span class="note">${dist}${dayWord(r.cell)}</span></div>
      <div class="rp"><b>${pylon(r.price)}</b><a href="${linkWaze(r.st)}" target="_blank" rel="noopener">${t("navTo")}</a>
        <button class="more-prices" data-act="row" data-v="${esc(r.st.id)}" aria-expanded="${state.open === r.st.id}">${t("allPrices")}</button></div>
      ${state.open === r.st.id ? renderDetail(r.st) : ""}
    </li>`;
  }).join("");
  return `
  <h2>${t("stationsH")}</h2><p class="sub">${rows.length} ${t("withPrice")}</p>
  <ol class="list" style="padding:0">${items}</ol>
  ${rows.length > 8 ? `<button class="more" data-act="more">${state.showAll ? t("showLess") : `${t("showAll")} ${rows.length}`}</button>` : ""}`;
}

function renderDetail(st) {
  const lines = FUEL_ORDER.filter((f) => st.fuels[f]).map((f) => {
    const c = st.fuels[f];
    const exact = isExact(c, st, f);
    const label = c.k === "min" ? t("minShort") : c.k === "user" ? (exact ? t("user") : t("userOld")) : t(c.k);
    return `<div><span>${t("fuels")[f]}<small style="display:block;color:var(--mute)">${label}${c.ch ? ", " + dayWord(c) : ""}</small></span><b>${fmtPrice(c.p)} €</b></div>`;
  }).join("");
  return `<div class="detail">${lines}<div><span><a href="${linkWaze(st)}" target="_blank" rel="noopener">${t("waze")}</a>, <a href="${linkGmaps(st)}" target="_blank" rel="noopener">${t("gmaps")}</a></span></div></div>`;
}

function renderChains() {
  const rows = rowsFor({ ignoreChain: true });
  const best = new Map();
  for (const r of rows) {
    const cur = best.get(r.st.chain);
    if (!cur || r.price < cur.price) best.set(r.st.chain, r);
  }
  const list = [...best.entries()].sort((a, b) => a[1].price - b[1].price);
  if (list.length < 2) return "";
  const lo = list[0][1].price, hi = list[list.length - 1][1].price;
  const bars = list.map(([slug, r]) => {
    const chain = state.data.chains[slug];
    const pct = 30 + (70 * (r.price - lo)) / (hi - lo || 1);
    const diff = ((r.price - lo) * 100).toFixed(1);
    return `<div class="bar">
      <button data-act="chain" data-v="${esc(slug)}" aria-pressed="${state.chain === slug}" ${state.chain === slug ? 'style="text-decoration:underline"' : ""}><i class="dot" style="background:${esc(chain.color)}"></i>${esc(chain.name)}</button>
      <div class="track"><div class="fill" style="width:${pct.toFixed(0)}%;background:${esc(chain.color)}"></div></div>
      <div><em>${fmtPrice(r.price)}</em><small>${r === list[0][1] ? "" : "+" + diff}</small></div>
    </div>`;
  }).join("");
  return `<h2>${t("chainsH")}</h2><p class="sub">${t("chainsSub")}</p><div class="bars">${bars}</div>`;
}

function renderTrend() {
  const h = state.history;
  const days = h ? Object.keys(h.days).sort() : [];
  const pts = days.map((d) => ({ d, e: h.days[d]?.[state.city]?.[state.fuel] })).filter((x) => x.e);
  if (pts.length < 2) return `<h2>${t("trendH")}</h2><p class="sub">${t("trendWait")}</p>`;
  const W = 340, H = 140, pl = 8, pr = 8, pt = 14, pb = 22;
  const vals = pts.flatMap((p) => [p.e.min, p.e.avg]);
  const lo = Math.min(...vals) - 0.005, hi = Math.max(...vals) + 0.005;
  const x = (i) => pl + (i * (W - pl - pr)) / (pts.length - 1);
  const y = (v) => pt + ((hi - v) * (H - pt - pb)) / (hi - lo || 1);
  const line = (key) => pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.e[key]).toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  const label = (d) => d.slice(8, 10) + "." + d.slice(5, 7);
  return `<h2>${t("trendH")}</h2><p class="sub">${t("trendSub")}</p>
  <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t("trendH")}">
    <path d="${line("avg")}" fill="none" stroke="var(--mute)" stroke-width="2" stroke-linejoin="round" stroke-dasharray="5 4"/>
    <path d="${line("min")}" fill="none" stroke="var(--amber)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${x(pts.length - 1)}" cy="${y(last.e.min)}" r="4.5" fill="var(--amber)"/>
    <text x="${pl}" y="${H - 5}">${label(pts[0].d)}</text>
    <text x="${W - pr}" y="${H - 5}" text-anchor="end">${label(last.d)}</text>
    <text x="${pl}" y="11">${hi.toFixed(3)}</text>
    <text x="${W - pr}" y="${y(last.e.min) + 20}" text-anchor="end">${fmtPrice(last.e.min)}</text>
  </svg>
  <div class="legend"><span><i style="background:var(--amber)"></i>${t("min_s")}</span><span><i style="background:var(--mute)"></i>${t("avg_s")}</span></div>`;
}

function spark(series, up) {
  if (!series || series.length < 2) return "";
  const W = 120, H = 30, lo = Math.min(...series), hi = Math.max(...series);
  const d = series.map((v, i) => `${i ? "L" : "M"}${((i * W) / (series.length - 1)).toFixed(1)},${(H - 2 - ((v - lo) * (H - 4)) / (hi - lo || 1)).toFixed(1)}`).join(" ");
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="30" aria-hidden="true"><path d="${d}" fill="none" stroke="${up ? "var(--bad)" : "var(--good)"}" stroke-width="2" stroke-linejoin="round"/></svg>`;
}
function renderOil() {
  const o = state.oil;
  if (!o) return "";
  const card = (name, x) => {
    const diff = x.price - x.prev, pct = (diff / x.prev) * 100, up = diff >= 0;
    return `<div><small>${name}</small><b>${x.price.toFixed(2)} $</b>
      <small class="${up ? "up" : "down"}">${up ? "+" : "−"}${Math.abs(diff).toFixed(2)} (${Math.abs(pct).toFixed(1)}%)</small>
      ${spark(x.series, up)}<small>${o.eurusd ? (x.price / o.eurusd).toFixed(2) + " € " + t("barrel") : ""}</small></div>`;
  };
  return `<h2>${t("oilH")}</h2><div class="oil">${card("Brent", o.brent)}${card("WTI", o.wti)}</div>`;
}

function render() {
  const keepScroll = window.scrollY;
  const focused = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.act : null;
  document.documentElement.lang = state.lang;
  if (!state.data || !state.data.stations.length) {
    app.innerHTML = `<div class="wrap">${renderHeader()}<div class="empty" style="grid-column:1/-1"><b>${t("noDataH")}</b>${t("noDataT")}</div></div>`;
    return;
  }
  const rows = rowsFor();
  app.innerHTML = `<div class="wrap">
    ${renderHeader()}
    ${renderInstall()}
    <div class="left">${renderFuelTabs()}${renderPylon(rows)}${renderCalc(rows)}</div>
    <div class="right">${renderList(rows)}${renderChains()}${renderTrend()}${renderOil()}</div>
    <footer class="foot"><p>${t("source")}</p></footer>
  </div>`;
  window.scrollTo(0, keepScroll);
  if (focused === "liters" || focused === "cons" || focused === "q") {
    const el = app.querySelector(`[data-act="${focused}"]`);
    if (el) { el.focus(); el.setSelectionRange?.(el.value.length, el.value.length); }
  }
}

/* ---------- data ---------- */
async function getJson(name, bust) {
  const res = await fetch(`data/${name}.json${bust ? "?t=" + Date.now() : ""}`, { cache: "no-cache" });
  if (!res.ok) throw new Error(name + " " + res.status);
  return res.json();
}
async function load(bust = false) {
  state.loading = true;
  render();
  const [data, history, oil] = await Promise.allSettled([getJson("prices", bust), getJson("history", bust), getJson("oil", bust)]);
  if (data.status === "fulfilled") state.data = data.value;
  if (history.status === "fulfilled") state.history = history.value;
  if (oil.status === "fulfilled") state.oil = oil.value;
  if (state.data && state.city !== "all" && !state.data.cities.some((c) => c.slug === state.city)) state.city = "riga";
  state.loading = false;
  render();
}

/* ---------- events ---------- */
function locate() {
  if (!navigator.geolocation) { alert(t("locFail")); return; }
  navigator.geolocation.getCurrentPosition(
    (pos) => { state.loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }; state.road = true; render(); },
    () => alert(t("locFail")),
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
  );
}

app.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]");
  if (!el || el.tagName === "SELECT" || el.tagName === "INPUT") return;
  if (el.dataset.act !== "row" && e.target.closest("a")) return;
  const v = el.dataset.v;
  switch (el.dataset.act) {
    case "theme": state.theme = state.theme === "light" ? "dark" : "light"; store.set("theme", state.theme); applyTheme(); break;
    case "lang": state.lang = state.lang === "ru" ? "en" : "ru"; store.set("lang", state.lang); break;
    case "refresh": load(true); return;
    case "fuel": state.fuel = v; store.set("fuel", v); state.showAll = false; break;
    case "mode": state.mode = v; store.set("mode", v); break;
    case "area": state.area = v || null; state.showAll = false; break;
    case "chain": state.chain = state.chain === v ? null : v; state.showAll = false; break;
    case "more": state.showAll = !state.showAll; break;
    case "row": state.open = state.open === v ? null : v; break;
    case "near": locate(); return;
    case "install": {
      const evt = installPrompt;
      if (evt) { evt.prompt(); evt.userChoice.finally(() => { installPrompt = null; render(); }); }
      return;
    }
    case "later": store.set("installHidden", Date.now()); break;
    default: return;
  }
  render();
});
app.addEventListener("change", (e) => {
  const el = e.target;
  if (el.dataset.act === "city") { state.city = el.value; state.area = null; state.chain = null; state.showAll = false; store.set("city", state.city); render(); }
  if (el.dataset.act === "road") { state.road = el.checked; render(); }
});
app.addEventListener("input", (e) => {
  const el = e.target;
  if (el.dataset.act === "q") { state.q = el.value; state.showAll = true; render(); return; }
  const n = parseFloat(String(el.value).replace(",", "."));
  if (el.dataset.act === "liters" && n > 0) { state.liters = n; store.set("liters", n); render(); }
  if (el.dataset.act === "cons" && n > 0) { state.consumption = n; store.set("consumption", n); render(); }
});
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installPrompt = e; if (state.data) render(); });
window.addEventListener("appinstalled", () => { state.installed = true; installPrompt = null; render(); });
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && state.data) {
    const ageMin = (Date.now() - Date.parse(state.data.generated_at)) / 60000;
    if (ageMin > 15) load(true); else render();
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
applyTheme();
load();
