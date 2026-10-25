"use strict";
/* Degvielas Radars: reads data/*.json (written by scripts/scrape.py) and
   shows the cheapest fuel in Latvia. No build step, no dependencies. */

const I18N = {
  ru: {
    heat: "Тепловая карта цен",
    sortPrice: "Цена", sortNear: "Рядом", sortFresh: "Свежие", retry: "Повторить",
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
    heat: "Price heat map",
    sortPrice: "Price", sortNear: "Nearest", sortFresh: "Freshest", retry: "Retry",
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

Object.assign(I18N.ru, {
  navPrices: "Цены", navMap: "Карта", navStats: "Анализ", navJournal: "Журнал",
  settings: "Настройки", language: "Язык", themeLabel: "Тема", dark: "Тёмная", light: "Светлая",
  haptics: "Вибрация при нажатиях", close: "Закрыть",
  discH: "Мои скидки", discHelp: "Скидка по карте лояльности, цент на литр. Цены в списке и на карте станут уже со скидкой.",
  discApply: "Учитывать скидки", discChip: "Со скидками", withDisc: "со скидкой",
  preview: "Тестовая версия",
  boardH: "Сейчас дешевле всего", otherFuels: "Другое топливо",
  sinceVisit: "с прошлого визита", low30: "Минимум за 30 дней", newPrice: "цена изменилась",
  favs: "Мои заправки", favOnly: "Избранные", addFav: "В избранное", removeFav: "Убрать из избранного",
  favAdded: "Добавлено в избранное", favRemoved: "Убрано из избранного", favNone: "В избранном ничего нет для этого топлива.",
  radius: "Радиус", anyDist: "Любой", noGeo: "Включите «Рядом со мной», чтобы искать по радиусу.",
  share: "Поделиться", copied: "Скопировано",
  mapFit: "Показать все", mapZoomIn: "Приблизить", mapZoomOut: "Отдалить", mapMe: "Где я",
  mapEmpty: "На карте нет станций с точной ценой. Переключитесь на «Все заправки».",
  cmpH: "Сравнение заправок", cmpBtn: "Сравнить", cmpAdd: "Добавить к сравнению", cmpRemove: "Убрать из сравнения", cmpMax: "Можно сравнить до 3 заправок", cmpClear: "Сбросить", cmpPrice: "Цена", cmpVsBest: "К лучшей", cmpBest: "Лучшая цена", cmpTank: "Бак", cmpDist: "Расстояние", cmpUpd: "Цена изменена", cmpRel: "Надёжность", cmpOther: "Другое топливо", cmpNeed: "Выберите минимум 2 заправки.",
  relHigh: "Подтверждена сетью", relMid: "От водителей", relLow: "Оценка по сети", relStale: "Возможно устарела", vsAvgLbl: "к средней по списку",
  nearestTag: "Ближайшая",
  mvMap: "Карта", mvBoth: "Вместе", mvList: "Список", onMap: "На карте",
  mapCheapest: "Самая дешёвая", mapHint: "Цвет цены: зелёный дешевле, красный дороже. Пунктир и синий: оценка по минимуму сети.",
  jH: "Журнал заправок", jSub: "Записи хранятся только на этом телефоне.",
  jDate: "Дата", jLiters: "Литров", jPrice: "Цена, €/л", jOdo: "Пробег, км", jFull: "Полный бак",
  jAdd: "Записать заправку", jBest: "Лучшая цена сейчас", jEmpty: "Записей пока нет. Добавьте заправку с пробегом, и приложение посчитает реальный расход.",
  jCons: "Расход", jAvgPrice: "Средняя цена", jMonth: "За этот месяц", jPer100: "100 км стоят",
  jUse: "Взять расход в калькулятор", jCsv: "Скопировать как CSV", jDel: "Удалить", jTotal: "Всего",
  jBad: "Укажите литры и цену", jSaved: "Записано", jUsed: "Расход перенесён в калькулятор",
  consUnit: "л/100 км", moUnit: "€",
  exportHint: "Таблица скопирована, вставьте её в Excel или Заметки",
  sharePrefix: "Дешевле всего",
  loading: "Загружаю цены…",
  resetLoc: "Сбросить место", refreshed: "Обновлено, данные от", locWait: "Уточняю…",
});
Object.assign(I18N.en, {
  navPrices: "Prices", navMap: "Map", navStats: "Insights", navJournal: "Log",
  settings: "Settings", language: "Language", themeLabel: "Theme", dark: "Dark", light: "Light",
  haptics: "Vibrate on taps", close: "Close",
  discH: "My discounts", discHelp: "Loyalty-card discount in cents per litre. Prices in the list and on the map will already include it.",
  discApply: "Apply discounts", discChip: "With discounts", withDisc: "with discount",
  preview: "Preview build",
  boardH: "Cheapest right now", otherFuels: "Other fuels",
  sinceVisit: "since your last visit", low30: "30-day low", newPrice: "price changed",
  favs: "My stations", favOnly: "Favourites", addFav: "Add to favourites", removeFav: "Remove from favourites",
  favAdded: "Added to favourites", favRemoved: "Removed from favourites", favNone: "None of your favourites has this fuel.",
  radius: "Radius", anyDist: "Any", noGeo: "Turn on “Near me” to search by radius.",
  share: "Share", copied: "Copied",
  mapFit: "Show all", mapZoomIn: "Zoom in", mapZoomOut: "Zoom out", mapMe: "My location",
  mapEmpty: "No stations with an exact price on the map. Switch to “All stations”.",
  cmpH: "Compare stations", cmpBtn: "Compare", cmpAdd: "Add to comparison", cmpRemove: "Remove from comparison", cmpMax: "You can compare up to 3 stations", cmpClear: "Clear", cmpPrice: "Price", cmpVsBest: "vs best", cmpBest: "Best price", cmpTank: "Tank", cmpDist: "Distance", cmpUpd: "Price changed", cmpRel: "Reliability", cmpOther: "Other fuels", cmpNeed: "Pick at least 2 stations.",
  relHigh: "Confirmed by the chain", relMid: "From drivers", relLow: "Chain-minimum estimate", relStale: "May be outdated", vsAvgLbl: "vs list average",
  nearestTag: "Nearest",
  mvMap: "Map", mvBoth: "Split", mvList: "List", onMap: "On map",
  mapCheapest: "Cheapest", mapHint: "Price colour: green is cheaper, red is dearer. Dashed blue: estimate from the chain minimum.",
  jH: "Fill-up log", jSub: "Entries are stored on this phone only.",
  jDate: "Date", jLiters: "Litres", jPrice: "Price, €/l", jOdo: "Odometer, km", jFull: "Full tank",
  jAdd: "Save fill-up", jBest: "Best price now", jEmpty: "No entries yet. Add a fill-up with the odometer reading and the app works out your real consumption.",
  jCons: "Consumption", jAvgPrice: "Average price", jMonth: "This month", jPer100: "100 km cost",
  jUse: "Use in the calculator", jCsv: "Copy as CSV", jDel: "Delete", jTotal: "Total",
  jBad: "Enter litres and price", jSaved: "Saved", jUsed: "Consumption copied to the calculator",
  consUnit: "l/100 km", moUnit: "€",
  exportHint: "Table copied, paste it into a spreadsheet or Notes",
  sharePrefix: "Cheapest",
  loading: "Loading prices…",
  resetLoc: "Clear location", refreshed: "Updated, data from", locWait: "Refining…",
});

const FUEL_ORDER = ["95", "98", "diesel", "dplus", "lpg", "cng"];
const BOARD_FUELS = ["95", "98", "diesel"];
const EXACT_KINDS = new Set(["station", "network", "user"]);
const USER_MAX_AGE_H = 72;
const USER_MAX_AGE_BY_FUEL = { lpg: 21 * 24, cng: 21 * 24 };
const ROAD_FACTOR = 1.3;
const STALE_AFTER_MIN = 20 * 60;
const RADII = [2, 5, 10, 25];

const store = {
  get(k, d) { try { const v = localStorage.getItem("dr." + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem("dr." + k, JSON.stringify(v)); } catch { /* private mode */ } },
};

const state = {
  view: "prices",
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
  radius: null,
  favOnly: false,
  favs: store.get("favs", []),
  disc: store.get("disc", {}),
  useDisc: store.get("useDisc", true),
  haptics: store.get("haptics", true),
  journal: store.get("journal", []),
  jf: { date: "", l: "", ppl: "", odo: "", full: true },
  sheet: false,
  selected: null,
  showAll: false,
  q: "",
  open: null,
  loc: null,
  loading: false,
  locating: false,
  installed: false,
  data: null, history: null, oil: null,
  mapMode: store.get("mapmode", "all"),
  mapView: store.get("mapview", "map"),
  cmp: [], cmpOpen: false,
  fpm: store.get("fpm", 4),
  trendRange: "30",
  heat: false,
  sort: "price",
  baseline: store.get("snap", null),
};
let installPrompt = null;
const isStandalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const INSTALL_SNOOZE_MS = 3 * 864e5;

const t = (k) => I18N[state.lang][k];
function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = state.theme === "light" ? "#f2ece2" : "#050403";
}
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const buzz = (ms = 8) => { if (state.haptics && navigator.vibrate) { try { navigator.vibrate(ms); } catch { /* ignore */ } } };

/* ---------- toast ---------- */
const toastEl = document.createElement("div");
toastEl.className = "toast";
toastEl.setAttribute("role", "status");
document.body.appendChild(toastEl);
let toastTimer = 0;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
}

/* ---------- icons ---------- */
const svg = (inner, size = 20, extra = "") => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${inner}</svg>`;
const ICON = {
  cmp: svg('<path d="M7 4v16M17 4v16"/><path d="M3 8l4-4 4 4M13 16l4 4 4-4"/>', 20),
  gear: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  refresh: svg('<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/>'),
  heart: svg('<path d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21z"/>', 20, 'class="hs"'),
  share: svg('<path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/>'),
  near: svg('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="8"/>'),
  close: svg('<path d="M18 6L6 18M6 6l12 12"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  minus: svg('<path d="M5 12h14"/>'),
  fit: svg('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
  nav: svg('<path d="M3 11l18-8-8 18-2-8-8-2z"/>', 16),
  prices: svg('<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.2"/>', 22),
  map: svg('<path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>', 22),
  journal: svg('<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5z"/><path d="M4 4.5v18"/><path d="M9 7h7M9 11h7"/>', 22),
  stats: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', 22),
  heat: svg('<path d="M12 2c3 4 6 6 6 11a6 6 0 0 1-12 0c0-2 1-3 2-4 .3 2 1 3 2 3 0-4-1-6 2-10z"/>'),
  trash: svg('<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>', 18),
  radar: `<svg class="radar" width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
    <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="1.5"/>
    <circle cx="16" cy="16" r="8" fill="none" stroke="currentColor" stroke-opacity=".25" stroke-width="1.5"/>
    <g class="sweep"><path d="M16 16L16 2A14 14 0 0 1 28.1 9z" fill="url(#rg)"/><line x1="16" y1="16" x2="16" y2="2" stroke="var(--amber)" stroke-width="2" stroke-linecap="round"/></g>
    <circle class="blip" cx="22" cy="21" r="2" fill="var(--amber)"/>
    <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f5a524" stop-opacity=".0"/><stop offset="1" stop-color="#f5a524" stop-opacity=".45"/></linearGradient></defs></svg>`,
};

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

/* ---------- animated digits ---------- */
const rolled = new Map();      // key -> string shown last time
const rollNext = new Map();
const DIGITS = "0123456789".replace(/./g, "<i>$&</i>");
function roll(str, key) {
  const prev = rolled.get(key) || "";
  rollNext.set(key, str);
  let out = "";
  [...str].forEach((ch, i) => {
    if (/\d/.test(ch)) {
      const pc = prev[prev.length - (str.length - i)];
      const from = pc && /\d/.test(pc) ? +pc : 0;
      out += `<span class="dg" style="--k:${i}"><span class="col" style="transform:translateY(${-from}em)" data-to="${ch}">${DIGITS}</span></span>`;
    } else out += `<span class="ch">${esc(ch)}</span>`;
  });
  return `<span class="roll" aria-label="${esc(str)}"><span aria-hidden="true">${out}</span></span>`;
}
function settleRolls() {
  for (const [k, v] of rollNext) rolled.set(k, v);
  rollNext.clear();
  const cols = app.querySelectorAll(".col");
  if (!cols.length) return;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    cols.forEach((c) => { c.style.transform = `translateY(${-c.dataset.to}em)`; });
  }));
}
function rollPrice(p, key, cls = "") {
  const s = fmtPrice(p);
  return `<span class="${cls}">${roll(s.slice(0, 4), key)}<sup>${roll(s.slice(4), key + "s")}</sup></span>`;
}

/* ---------- prices ---------- */
function isExact(cell, st, fuel) {
  if (st.stale || !EXACT_KINDS.has(cell.k)) return false;
  return cell.k !== "user" || ageHours(cell) <= (USER_MAX_AGE_BY_FUEL[fuel] ?? USER_MAX_AGE_H);
}
function fmtPrice(p) { return p.toFixed(3); }
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
const discOf = (chain) => (state.useDisc ? (+state.disc[chain] || 0) / 100 : 0);
const hasDisc = () => Object.values(state.disc).some((v) => +v > 0);
const stationById = (id) => state.data.stations.find((s) => s.id === id);

function rowsFor(opts = {}) {
  const { ignoreChain = false, ignoreMode = false, scopeOnly = false, fuel = state.fuel } = opts;
  const d = state.data;
  if (!d) return [];
  const rows = [];
  const query = state.q.trim().toLowerCase();
  for (const st of d.stations) {
    if (state.city !== "all" && st.city !== state.city) continue;
    if (state.area && !(st.areas || []).includes(state.area)) continue;
    if (!ignoreChain && state.chain && st.chain !== state.chain) continue;
    const cell = st.fuels[fuel];
    if (!cell) continue;
    const exact = isExact(cell, st, fuel);
    if (!scopeOnly) {
      if (query && !(`${d.chains[st.chain].name} ${st.address}`.toLowerCase().includes(query))) continue;
      if (state.favOnly && !state.favs.includes(st.id)) continue;
    }
    if (!ignoreMode && state.mode === "exact" && !exact) continue;
    const disc = discOf(st.chain);
    const price = Math.round((cell.p - disc) * 1000) / 1000;
    const row = { st, cell, fuel, base: cell.p, price, disc, exact, dist: null, total: null };
    if (state.loc) {
      row.dist = haversineKm(state.loc, st) * ROAD_FACTOR;
      if (!scopeOnly && state.radius && row.dist > state.radius) continue;
      const extraL = (2 * row.dist * state.consumption) / 100;
      row.total = price * (state.liters + extraL);
    }
    rows.push(row);
  }
  const useTotal = !scopeOnly && state.road && state.loc;
  const outdated = (r) => (r.cell.k === "user" && !r.exact ? 1 : 0); // old driver prices go last
  rows.sort((a, b) =>
    outdated(a) - outdated(b) ||
    (useTotal ? a.total - b.total
      : a.price - b.price || (a.dist ?? 0) - (b.dist ?? 0) || (a.cell.ago ?? 9e9) - (b.cell.ago ?? 9e9)));
  return rows;
}
function bestFor(fuel) {
  return rowsFor({ fuel, scopeOnly: true, ignoreMode: true }).find((r) => r.exact) || null;
}
function historyDelta(fuel = state.fuel) {
  const h = state.history;
  if (!h) return null;
  const days = Object.keys(h.days).sort();
  if (days.length < 2) return null;
  const a = h.days[days[days.length - 1]]?.[state.city]?.[fuel];
  const b = h.days[days[days.length - 2]]?.[state.city]?.[fuel];
  if (!a || !b) return null;
  return { now: a.min, prev: b.min, delta: a.min - b.min };
}
/* change against the last visit (preferred) or yesterday */
function changeFor(fuel, row) {
  const b = state.baseline?.v?.[`${state.city}|${fuel}`];
  if (b != null && Math.abs(row.base - b) >= 0.0005) return { delta: row.base - b, src: "visit", prev: b };
  if (!state.area && !state.chain) {
    const h = historyDelta(fuel);
    if (h && Math.abs(h.delta) >= 0.0005) return { delta: h.delta, src: "day", prev: h.prev };
  }
  return null;
}
function low30(fuel, base) {
  const h = state.history;
  if (!h || state.area || state.chain) return false;
  const mins = Object.keys(h.days).sort().slice(-30).map((d) => h.days[d]?.[state.city]?.[fuel]?.min).filter((v) => v != null);
  return mins.length >= 3 && base <= Math.min(...mins) + 0.0004;
}
function saveSnap() {
  if (!state.data) return;
  const old = store.get("snap", null);
  const fresh = !old || Date.now() - old.t > 3 * 3600e3;
  const snap = fresh ? { t: Date.now(), v: {}, f: {} } : old;
  snap.v = snap.v || {}; snap.f = snap.f || {};
  for (const f of FUEL_ORDER) {
    const r = bestFor(f);
    const key = `${state.city}|${f}`;
    if (r && (fresh || snap.v[key] == null)) snap.v[key] = r.base;
  }
  for (const id of state.favs) {
    const st = stationById(id);
    if (!st) continue;
    for (const f in st.fuels) { const key = `${id}|${f}`; if (fresh || snap.f[key] == null) snap.f[key] = st.fuels[f].p; }
  }
  store.set("snap", snap);
}
function heatHue(price, lo, hi) { return Math.round(140 - 132 * clamp((price - lo) / (hi - lo || 1), 0, 1)); }

const pylonStatic = (p) => { const s = fmtPrice(p); return `${s.slice(0, 4)}<sup>${s.slice(4)}</sup>`; };
const IS_PREVIEW = /\/next(\/|$)/.test(location.pathname);

/* ---------- journal maths ---------- */
function journalStats() {
  const list = [...state.journal].sort((a, b) => a.t.localeCompare(b.t) || (a.odo ?? 0) - (b.odo ?? 0) || a.id - b.id);
  const cons = {};
  let last = null, acc = 0, segL = 0, segD = 0;
  for (const e of list) {
    if (!last) { if (e.full && e.odo != null) { last = e; acc = 0; } continue; }
    acc += e.l;
    if (e.full && e.odo != null) {
      if (e.odo > last.odo) { cons[e.id] = (acc / (e.odo - last.odo)) * 100; segL += acc; segD += e.odo - last.odo; }
      last = e; acc = 0;
    }
  }
  const month = rigaToday().slice(0, 7);
  let spend = 0, totalSpend = 0, totalL = 0;
  for (const e of state.journal) {
    const c = e.l * e.ppl;
    totalSpend += c; totalL += e.l;
    if (e.t.startsWith(month)) spend += c;
  }
  return {
    cons, avgCons: segD ? (segL / segD) * 100 : null,
    avgPrice: totalL ? totalSpend / totalL : null, spend, totalSpend, totalL,
    newest: [...list].reverse(),
  };
}

/* ---------- rendering ---------- */
const app = document.getElementById("app");

function linkWaze(st) { return `https://waze.com/ul?ll=${st.lat},${st.lng}&navigate=yes`; }
function linkGmaps(st) { return `https://www.google.com/maps/dir/?api=1&destination=${st.lat},${st.lng}`; }
function presentFuels() {
  const present = new Set();
  if (state.data) for (const st of state.data.stations) if (state.city === "all" || st.city === state.city) for (const f in st.fuels) present.add(f);
  return FUEL_ORDER.filter((f) => present.has(f));
}
const heartBtn = (id, cls = "heart") => {
  const on = state.favs.includes(id);
  return `<button class="${cls}" data-act="fav" data-v="${esc(id)}" aria-pressed="${on}" aria-label="${on ? t("removeFav") : t("addFav")}">${ICON.heart}</button>`;
};

const cmpBtn = (id, cls = "cmp-btn") => {
  const on = state.cmp.includes(id);
  return `<button class="${cls}" data-act="cmp" data-v="${esc(id)}" aria-pressed="${on}" aria-label="${on ? t("cmpRemove") : t("cmpAdd")}" title="${on ? t("cmpRemove") : t("cmpAdd")}">${ICON.cmp}</button>`;
};
function reliability(st, cell, fuel) {
  const exact = isExact(cell, st, fuel);
  if (st.stale) return { lvl: 0, key: "relStale" };
  if (cell.k === "user") return exact ? { lvl: 2, key: "relMid" } : { lvl: 0, key: "relStale" };
  if (!exact) return { lvl: 1, key: "relLow" };
  return { lvl: 3, key: "relHigh" };
}
function relBadge(rel) {
  return `<span class="rel l${rel.lvl}" title="${t(rel.key)}"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>${t(rel.key)}${rel.lvl === 0 ? " ⚠" : ""}</span>`;
}

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
  const picker = state.view !== "journal" && cities.length ? `<div class="picker">
    <select data-act="city" aria-label="${t("city")}"><option value="all" ${state.city === "all" ? "selected" : ""}>${t("allCountry")} (${d.stations.length})</option>${cities.map((c) => `<option value="${esc(c.slug)}" ${c.slug === state.city ? "selected" : ""}>${esc(c.name)} (${c.count})</option>`).join("")}</select>
    <button class="icon-btn ${state.loc ? "on" : ""}" data-act="near" ${state.locating ? 'aria-busy="true"' : ""} aria-label="${t("nearMe")}" title="${t("nearMe")}">${ICON.near}${state.loc ? "" : `<span>${state.locating ? t("locWait") : t("nearMe")}</span>`}</button>
  </div>` : "";
  const chips = state.view !== "journal" && areas.length ? `<div class="chips" role="group">
    <button class="chip" data-act="area" data-v="" aria-pressed="${!state.area}">${t("allArea")}</button>
    ${areas.map((a) => `<button class="chip" data-act="area" data-v="${esc(a.slug)}" aria-pressed="${state.area === a.slug}">${esc(a.name)}<small>${a.count}</small></button>`).join("")}
  </div>` : "";
  return `
  <header class="top"><div class="top-row">
    ${ICON.radar}
    <h1 class="brand">Degvielas <span>Radars</span>${IS_PREVIEW ? `<em class="beta">${t("preview")}</em>` : ""}</h1>
    <button class="icon-btn" data-act="refresh" aria-label="${t("refresh")}" ${state.loading ? 'aria-busy="true"' : ""}>${ICON.refresh}</button>
    <button class="icon-btn" data-act="sheet" aria-label="${t("settings")}">${ICON.gear}</button>
  </div>
  <p class="meta">${meta || "&nbsp;"}</p>
  ${picker}${chips}
  </header>`;
}

function renderInstall() {
  if (isStandalone() || state.installed) return "";
  if (Date.now() - store.get("installHidden", 0) < INSTALL_SNOOZE_MS) return "";
  const action = installPrompt ? `<button class="btn-install" data-act="install">${t("install")}</button>` : "";
  const text = installPrompt ? t("installText") : isIos() ? t("installIos") : t("installAndroid");
  return `<aside class="install" aria-label="${t("install")}"><p>${text}</p>${action}<button class="install-later" data-act="later">${t("later")}</button></aside>`;
}

function fuelTabs() {
  const fuels = presentFuels();
  return `<div class="fuels" role="group">${fuels.map((f) => `<button class="fuel" data-act="fuel" data-v="${f}" aria-pressed="${state.fuel === f}">${t("fuels")[f]}</button>`).join("")}</div>`;
}

function tileSpark(f) {
  const h = state.history;
  if (!h || !window.Charts) return "";
  const vals = Object.keys(h.days).sort().slice(-14).map((d) => h.days[d]?.[state.city]?.[f]?.min).filter((v) => v != null);
  if (vals.length < 2) return "";
  return `<span class="ts">${Charts.sparkline(vals, vals[vals.length - 1] > vals[0])}</span>`;
}

function renderBoard() {
  const fuels = presentFuels();
  const tiles = BOARD_FUELS.map((f, i) => {
    const sel = state.fuel === f;
    const r = fuels.includes(f) ? bestFor(f) : null;
    if (!r) return `<button class="tile off" data-act="fuel" data-v="${f}" aria-pressed="${sel}" style="--i:${i}"><span class="tf">${t("fuels")[f]}</span><span class="tp">—</span></button>`;
    const ch = changeFor(f, r);
    const dcls = ch ? (ch.delta < 0 ? "down" : "up") : "";
    const chain = state.data.chains[r.st.chain];
    return `<button class="tile ${sel ? "sel" : ""} ${ch && ch.src === "visit" ? "chg " + dcls : ""}" data-act="fuel" data-v="${f}" aria-pressed="${sel}" style="--i:${i};--c:${esc(chain.color)}">
      <span class="tf">${t("fuels")[f]}</span>
      <span class="tp">${rollPrice(r.price, "tile" + f, "bp")}</span>
      <span class="tc"><i class="dot" style="background:${esc(chain.color)}"></i>${esc(chain.name)}</span>
      ${tileSpark(f)}
      <span class="td ${dcls}" ${ch ? `title="${ch.src === "visit" ? t("sinceVisit") : t("vsYest")}"` : ""}>${ch ? `${ch.delta < 0 ? "▼" : "▲"} ${(Math.abs(ch.delta) * 100).toFixed(1)}` : "&nbsp;"}</span>
    </button>`;
  }).join("");
  const other = fuels.filter((f) => !BOARD_FUELS.includes(f));
  return `<section class="board" aria-label="${t("boardH")}">
    <div class="tiles">${tiles}</div>
    ${other.length ? `<div class="chips" role="group" aria-label="${t("otherFuels")}">${other.map((f) => `<button class="chip" data-act="fuel" data-v="${f}" aria-pressed="${state.fuel === f}">${t("fuels")[f]}</button>`).join("")}</div>` : ""}
  </section>`;
}

function renderFilters() {
  const chips = [];
  if (state.favs.length) chips.push(`<button class="chip" data-act="favonly" aria-pressed="${state.favOnly}">♥ ${t("favOnly")}<small>${state.favs.length}</small></button>`);
  if (hasDisc()) chips.push(`<button class="chip" data-act="discchip" aria-pressed="${state.useDisc}">% ${t("discChip")}</button>`);
  if (state.loc) {
    chips.push(`<button class="chip" data-act="noloc">✕ ${t("resetLoc")}</button>`);
    chips.push(`<button class="chip" data-act="radius" data-v="" aria-pressed="${!state.radius}">${t("anyDist")}</button>`);
    for (const r of RADII) chips.push(`<button class="chip" data-act="radius" data-v="${r}" aria-pressed="${state.radius === r}">≤ ${r} ${t("km")}</button>`);
  }
  return `<div class="seg" role="group">
    <button data-act="mode" data-v="exact" aria-pressed="${state.mode === "exact"}">${t("exact")}</button>
    <button data-act="mode" data-v="all" aria-pressed="${state.mode === "all"}">${t("all")}</button>
  </div>
  <div class="search"><input type="search" data-act="q" value="${esc(state.q)}" placeholder="${t("search")}" aria-label="${t("search")}" autocomplete="off"></div>
  ${chips.length ? `<div class="chips" role="group">${chips.join("")}</div>` : ""}`;
}

function renderHero(rows) {
  if (!rows.length) {
    const body = state.q.trim() ? t("noMatch") : state.favOnly ? t("favNone") : t("emptyT");
    const more = state.mode === "exact" && !state.favOnly ? `<p><button class="chip" data-act="mode" data-v="all">${t("showAllStations")}</button></p>` : "";
    return `<div class="empty"><b>${t("emptyH")}</b>${body}${more}</div>`;
  }
  const top = rows[0];
  const chain = state.data.chains[top.st.chain];
  const ch = changeFor(state.fuel, top);
  let delta = "";
  if (ch) {
    const c = Math.abs(ch.delta) * 100;
    delta = `<p class="delta"><span class="wn ${ch.delta < 0 ? "down" : "up"}"><s>${fmtPrice(ch.prev)}</s><b>${fmtPrice(top.base)}</b></span> <span class="${ch.delta < 0 ? "down" : "up"}">${ch.delta < 0 ? "▼ −" : "▲ +"}${c.toFixed(1)} ${t("cents")}</span> · ${ch.src === "visit" ? t("sinceVisit") : t("vsYest")}</p>`;
  } else if (!state.area && !state.chain && historyDelta()) {
    delta = `<p class="delta">${t("vsYest")}: ${t("same")}</p>`;
  }
  let hint = "";
  if (state.mode === "exact") {
    const est = rowsFor({ ignoreMode: true }).find((r) => !r.exact && r.price < top.price);
    if (est) hint = `<p class="hint">${t("maybeCheaper")}: ${esc(state.data.chains[est.st.chain].name)} ${fmtPrice(est.price)} €. <button data-act="mode" data-v="all">${t("show")}</button></p>`;
  }
  if (!hint && state.mode === "exact" && rows.length < 5) hint = `<p class="hint">${t("fewExact")} <button data-act="mode" data-v="all">${t("showAllStations")}</button></p>`;
  const extra = top.dist != null ? `<br>${top.dist.toFixed(1)} ${t("km")}` : "";
  const lowBadge = top.exact && low30(state.fuel, top.base) ? `<span class="tag low">★ ${t("low30")}</span>` : "";
  return `
  <section class="pylon" aria-label="${t("cheapest")}">
    <div class="p-top"><div><p class="where"><i class="ping" style="--c:${esc(chain.color)}"></i>${esc(chain.name)}</p>
      <p class="addr">${esc(top.st.address)}</p></div>${heartBtn(top.st.id, "heart on-dark")}</div>
    <div class="price-line">
      <div class="pylon-price" aria-label="${fmtPrice(top.price)} €/L">${rollPrice(top.price, "hero")}</div>
      <div class="price-side"><b>€/L</b>${t("fuels")[state.fuel]}${extra}</div>
    </div>
    <span class="tag ${top.exact ? "good" : "warn"}">${kindLabel(top)}</span>
    ${top.cell.ch ? `<span class="tag">${dayWord(top.cell)}</span>` : ""}
    ${top.disc > 0 ? `<span class="tag good">% ${t("withDisc")}: −${(top.disc * 100).toFixed(1)} ${t("cents")}</span>` : ""}
    ${lowBadge}
    ${delta}
    <div class="actions">
      <a class="btn" href="${linkWaze(top.st)}" target="_blank" rel="noopener">${t("waze")}</a>
      <a class="btn ghost" href="${linkGmaps(top.st)}" target="_blank" rel="noopener">${t("gmaps")}</a>
      <button class="btn ghost sq" data-act="share" data-v="${esc(top.st.id)}" aria-label="${t("share")}" title="${t("share")}">${ICON.share}</button>
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
    <div class="gauge" style="--f:${clamp(L / 80, 0.03, 1).toFixed(3)}" aria-hidden="true"><span class="liquid"></span></div>
    <div class="sum"><strong>${t("tankCost")} ${roll(cost.toFixed(2), "cost")} €</strong>
      <p class="save">${saveAvg >= 0.005 ? `${t("saveAvg")} ${saveAvg.toFixed(2)} €` : ""}${saveAvg >= 0.005 && saveMax >= 0.005 ? ", " : ""}${saveMax >= 0.005 ? `${t("saveMax")} ${saveMax.toFixed(2)} €` : ""}</p></div>
  </div>`;
}

function renderFavs() {
  if (!state.favs.length || state.favOnly) return "";
  const cards = state.favs.map((id) => stationById(id)).filter(Boolean).map((st) => {
    const cell = st.fuels[state.fuel];
    if (!cell) return null;
    const price = cell.p - discOf(st.chain);
    return { st, cell, price, exact: isExact(cell, st, state.fuel) };
  }).filter(Boolean).sort((a, b) => a.price - b.price);
  const inner = cards.length ? cards.map((c, i) => {
    const chain = state.data.chains[c.st.chain];
    const prev = state.baseline?.f?.[`${c.st.id}|${state.fuel}`];
    const dd = prev != null && Math.abs(c.cell.p - prev) >= 0.0005 ? c.cell.p - prev : null;
    return `<button class="fav ${c.exact ? "" : "est"}" data-act="favgo" data-v="${esc(c.st.id)}" style="--i:${i};--c:${esc(chain.color)}">
      <span class="fn"><i class="dot" style="background:${esc(chain.color)}"></i>${esc(chain.name)}</span>
      <span class="fa">${esc(c.st.address.split(",")[0])}</span>
      <span class="fp">${rollPrice(c.price, "fav" + i, "bp")}</span>
      ${dd != null ? `<span class="td ${dd < 0 ? "down" : "up"}">${dd < 0 ? "▼" : "▲"} ${(Math.abs(dd) * 100).toFixed(1)}</span>` : ""}
    </button>`;
  }).join("") : `<p class="sub">${t("favNone")}</p>`;
  return `<h2>♥ ${t("favs")}</h2><div class="favrow">${inner}</div>`;
}

function sortedRows(rows) {
  if (state.sort === "near" && state.loc) return [...rows].sort((a, b) => (a.dist ?? 9e9) - (b.dist ?? 9e9) || a.price - b.price);
  if (state.sort === "fresh") return [...rows].sort((a, b) => (a.cell.ago ?? 9e9) - (b.cell.ago ?? 9e9) || a.price - b.price);
  return rows;
}
function renderSort() {
  const opts = [["price", t("sortPrice")], ["near", t("sortNear")], ["fresh", t("sortFresh")]];
  return `<div class="seg slim sort" role="group">${opts.map(([k, l]) => `<button data-act="sort" data-v="${k}" aria-pressed="${(state.sort === k && (k !== "near" || state.loc)) ? "true" : "false"}">${l}</button>`).join("")}</div>`;
}
function renderList(rows, onMap = false) {
  if (!rows.length) return "";
  const byPrice = rows;
  rows = sortedRows(rows);
  const exactPrices = byPrice.filter((r) => r.exact).map((r) => r.price);
  const pool = exactPrices.length ? exactPrices : byPrice.map((r) => r.price);
  const lo = Math.min(...pool), hi = Math.max(...pool);
  const limit = state.showAll ? rows.length : 8;
  let nearId = null;
  if (state.loc) { let bd = Infinity; for (const r of rows) if (r.dist != null && r.dist < bd) { bd = r.dist; nearId = r.st.id; } }
  const items = rows.slice(0, limit).map((r, i) => {
    const chain = state.data.chains[r.st.chain];
    const note = !r.exact
      ? `<span class="note warn">${r.cell.k === "min" ? t("minShort") : kindLabel(r)}</span>`
      : r.cell.k === "user" ? `<span class="note">${kindLabel(r)}</span>` : "";
    const dist = r.dist != null ? `${r.dist.toFixed(1)} ${t("km")}, ` : "";
    return `<li class="row ${r.exact ? "heat" : "est"} ${r.st.id === nearId ? "near" : ""}" data-id="${esc(r.st.id)}" style="--i:${Math.min(i, 14)};--h:${heatHue(r.price, lo, hi)}">
      <span class="rank">${i + 1}</span>
      <div class="who"><b><i class="dot" style="background:${esc(chain.color)}"></i>${esc(chain.name)}</b>
        <span>${esc(r.st.address)}</span>${note}
        <span class="note">${r.st.id === nearId ? `<b class="neartag">◎ ${t("nearestTag")}</b> ` : ""}${dist}${dayWord(r.cell)}</span></div>
      <div class="rp"><b class="hp">${pylonStatic(r.price)}</b>${r.disc > 0 ? `<s class="was">${fmtPrice(r.base)}</s>` : ""}
        <div class="ra">${heartBtn(r.st.id)}${cmpBtn(r.st.id)}${onMap ? `<button class="ra-btn" data-act="onmap" data-v="${esc(r.st.id)}">${ICON.map}${t("onMap")}</button>` : ""}<a href="${linkWaze(r.st)}" target="_blank" rel="noopener">${ICON.nav}${t("navTo")}</a></div>
        <button class="more-prices" data-act="row" data-v="${esc(r.st.id)}" aria-expanded="${state.open === r.st.id}">${t("allPrices")}</button></div>
      ${state.open === r.st.id ? renderDetail(r.st) : ""}
    </li>`;
  }).join("");
  return `
  <h2>${t("stationsH")}</h2><p class="sub">${rows.length} ${t("withPrice")}</p>
  ${renderSort()}
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
  for (const r of rows) { const cur = best.get(r.st.chain); if (!cur || r.price < cur.price) best.set(r.st.chain, r); }
  const list = [...best.entries()].sort((a, b) => a[1].price - b[1].price);
  if (list.length < 2) return "";
  const lo = list[0][1].price, hi = list[list.length - 1][1].price;
  const bars = list.map(([slug, r], i) => {
    const chain = state.data.chains[slug];
    const pct = 30 + (70 * (r.price - lo)) / (hi - lo || 1);
    const diff = ((r.price - lo) * 100).toFixed(1);
    return `<div class="bar" style="--i:${i}">
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
  const area = `${line("min")} L${x(pts.length - 1).toFixed(1)},${H - pb} L${x(0).toFixed(1)},${H - pb} Z`;
  return `<h2>${t("trendH")}</h2><p class="sub">${t("trendSub")}</p>
  <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t("trendH")}">
    <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--amber)" stop-opacity=".35"/><stop offset="1" stop-color="var(--amber)" stop-opacity="0"/></linearGradient></defs>
    <path class="area" d="${area}" fill="url(#ag)"/>
    <path class="ln avg" pathLength="1" d="${line("avg")}" fill="none" stroke="var(--mute)" stroke-width="2" stroke-linejoin="round" stroke-opacity=".8"/>
    <path class="ln" pathLength="1" d="${line("min")}" fill="none" stroke="var(--amber)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
    <circle class="end" cx="${x(pts.length - 1)}" cy="${y(last.e.min)}" r="4.5" fill="var(--amber)"/>
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
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" height="30" aria-hidden="true"><path class="ln" pathLength="1" d="${d}" fill="none" stroke="${up ? "var(--bad)" : "var(--good)"}" stroke-width="2" stroke-linejoin="round"/></svg>`;
}
function renderOil() {
  const o = state.oil;
  if (!o) return "";
  const card = (name, x, key) => {
    const diff = x.price - x.prev, pct = (diff / x.prev) * 100, up = diff >= 0;
    return `<div><small>${name}</small><b>${roll(x.price.toFixed(2), key)} $</b>
      <small class="${up ? "up" : "down"}">${up ? "▲ +" : "▼ −"}${Math.abs(diff).toFixed(2)} (${Math.abs(pct).toFixed(1)}%)</small>
      ${spark(x.series, up)}<small>${o.eurusd ? (x.price / o.eurusd).toFixed(2) + " € " + t("barrel") : ""}</small></div>`;
  };
  return `<h2>${t("oilH")}</h2><div class="oil">${card("Brent", o.brent, "brent")}${card("WTI", o.wti, "wti")}</div>`;
}

function renderPrices() {
  const rows = rowsFor();
  return `${renderInstall()}
    <div class="left">${renderBoard()}${renderHero(rows)}${renderCalc(rows)}</div>
    <div class="right">${renderFilters()}${renderFavs()}${renderList(rows)}<div class="rv">${renderChains()}</div><div class="rv">${renderTrend()}</div><div class="rv">${renderOil()}</div></div>`;
}

/* ---------- map view ---------- */
let mapObj = null, mapHost = null, mapFitKey = "", lastPop = null;

function mapRows() {
  const rows = rowsFor({ scopeOnly: true, ignoreMode: state.mapMode === "all" });
  // exact prices first (they decide the colours and the "cheapest" pin), estimates after them
  return [...rows.filter((r) => r.exact), ...rows.filter((r) => !r.exact)];
}

function renderMapView() {
  const rows = mapRows();
  let pop = "";
  if (state.selected) {
    const st = stationById(state.selected);
    if (st && st.fuels[state.fuel]) {
      const cell = st.fuels[state.fuel], chain = state.data.chains[st.chain];
      const exact = isExact(cell, st, state.fuel);
      const row = { cell, exact };
      const disc = discOf(st.chain);
      const fresh = lastPop !== state.selected;
      lastPop = state.selected;
      const best = rows[0] && rows[0].exact && rows[0].st.id === st.id;
      pop = `<div class="mpop ${fresh ? "in" : ""}">
        <div class="mp-head"><span class="mp-n"><i class="dot" style="background:${esc(chain.color)}"></i><b>${esc(chain.name)}</b>${best ? `<span class="tag good">${t("mapCheapest")}</span>` : ""}</span>
          ${cmpBtn(st.id)}${heartBtn(st.id)}<button class="icon-btn sm" data-act="mclose" aria-label="${t("close")}">${ICON.close}</button></div>
        <p class="addr">${esc(st.address)}</p>
        <div class="mp-price"><span class="pp">${rollPrice(cell.p - disc, "pop", "bp")}</span><span class="u">€/L</span>
          <span class="tag ${exact ? "good" : "warn"}">${kindLabel(row)}</span></div>
        ${(() => { const pc = exact ? cheaperThanPct({ exact, price: cell.p - disc }) : null; return pc == null ? "" : Charts.meter(pc, state.lang === "ru" ? `Дешевле, чем у ${pc}% станций` : `Cheaper than ${pc}% of stations`); })()}
        ${(() => {
          const ex = rows.filter((r) => r.exact).map((r) => r.price);
          const avg = ex.length ? ex.reduce((a, b) => a + b, 0) / ex.length : null;
          const d = exact && avg != null ? (cell.p - disc - avg) * 100 : null;
          const dTxt = d == null ? "" : Math.abs(d) < 0.05 ? `<span class="vsavg">= ${t("vsAvgLbl")}</span>` : `<span class="vsavg ${d < 0 ? "down" : "up"}">${d < 0 ? "▼ −" : "▲ +"}${Math.abs(d).toFixed(1)} ${t("cents")} ${t("vsAvgLbl")}</span>`;
          return `<div class="mp-meta">${relBadge(reliability(st, cell, state.fuel))}${dTxt}${cell.ch ? `<span class="upd">${dayWord(cell)}</span>` : ""}${state.cmp.length >= 2 ? `<button class="cmp-chip" data-act="cmpopen">${ICON.cmp}${t("cmpBtn")} · ${state.cmp.length}/3</button>` : ""}</div>`;
        })()}
        <div class="actions">
          <a class="btn" href="${linkWaze(st)}" target="_blank" rel="noopener">${t("waze")}</a>
          <a class="btn ghost" href="${linkGmaps(st)}" target="_blank" rel="noopener">${t("gmaps")}</a>
          <button class="btn ghost sq" data-act="share" data-v="${esc(st.id)}" aria-label="${t("share")}">${ICON.share}</button>
        </div>
        <button class="more-prices" data-act="row" data-v="${esc(st.id)}" aria-expanded="${state.open === st.id}">${t("allPrices")}</button>
        ${state.open === st.id ? renderDetail(st) : ""}
      </div>`;
    } else lastPop = null;
  } else lastPop = null;
  const mv = state.mapView;
  const views = [["map", t("mvMap")], ["split", t("mvBoth")], ["list", t("mvList")]];
  const seg = `<div class="mv-row"><div class="seg slim" role="group">
    <button data-act="mapmode" data-v="exact" aria-pressed="${state.mapMode === "exact"}">${t("exact")}</button>
    <button data-act="mapmode" data-v="all" aria-pressed="${state.mapMode === "all"}">${t("all")}</button>
  </div><div class="seg slim mv" role="group">${views.map(([k, l]) => `<button data-act="mview" data-v="${k}" aria-pressed="${mv === k}">${l}</button>`).join("")}</div></div>`;
  const listHtml = mv !== "map" ? renderList(rows, true) : "";
  if (mv === "list") return `${fuelTabs()}${seg}${listHtml || `<div class="empty"><b>${t("emptyH")}</b>${t("mapEmpty")}</div>`}`;
  return `${fuelTabs()}${seg}
  <div class="mapbox ${mv === "split" ? "short" : ""}">
    <div id="mapslot"></div>
    <div class="mm-ctl zoom">
      <button data-act="mzoom" data-v="1" aria-label="${t("mapZoomIn")}">${ICON.plus}</button>
      <button data-act="mzoom" data-v="-1" aria-label="${t("mapZoomOut")}">${ICON.minus}</button>
      <button data-act="mfit" aria-label="${t("mapFit")}">${ICON.fit}</button>
      <button data-act="mme" class="${state.loc ? "on" : ""}" aria-label="${t("mapMe")}">${ICON.near}</button>
    </div>
    <div class="mm-ctl left"><button data-act="mheat" class="${state.heat ? "on" : ""}" aria-label="${t("heat")}" title="${t("heat")}" aria-pressed="${state.heat}">${ICON.heat}</button></div>
    ${rows.length ? "" : `<div class="mm-empty">${t("mapEmpty")}</div>`}
    ${pop}
  </div>
  ${mv === "split" ? listHtml : `<p class="sub" style="margin-top:10px">${t("mapHint")}</p>`}`;
}

function attachMap() {
  const slot = app.querySelector("#mapslot");
  if (!slot || typeof MiniMap === "undefined") return;
  if (!mapObj) {
    mapHost = document.createElement("div");
    mapHost.className = "mapel";
    mapObj = new MiniMap(mapHost, { onPick: pickStation });
    mapHost.addEventListener("click", (e) => {
      if (mapObj.dragged || e.target.closest(".mk")) return;
      if (state.selected) { state.selected = null; render(false); }
    });
  }
  slot.replaceWith(mapHost);
  mapObj._measure();
  mapObj.setDark(state.theme !== "light");
  const rows = mapRows();
  const exactPrices = rows.filter((r) => r.exact).map((r) => r.price);
  const pool = exactPrices.length ? exactPrices : rows.map((r) => r.price);
  const lo = Math.min(...pool), hi = Math.max(...pool);
  const list = rows.map((r, i) => {
    const chain = state.data.chains[r.st.chain];
    const hue = r.exact ? heatHue(r.price, lo, hi) : 220;
    const sel = state.selected === r.st.id;
    const g = r.exact && hi > lo ? clamp(1 - (r.price - lo) / (hi - lo), 0, 1) : 0;   // 1 = cheapest, glows most
    return {
      id: r.st.id, noCluster: state.heat, lat: r.st.lat, lng: r.st.lng, prio: r.exact ? i : 1000 + i, force: sel || (i === 0 && r.exact),
      cls: `${sel ? "sel " : ""}${i === 0 && r.exact ? "best " : ""}${r.exact ? "" : "est"}`.trim(),
      html: state.heat && !sel ? `<span class="blob" style="--h:${hue}"></span>` : `<span class="pin" style="--h:${hue};--c:${esc(chain.color)};--g:${g.toFixed(2)}"><i class="pdot"></i><b>${fmtPrice(r.price)}</b></span>`,
      dotHtml: state.heat && !sel ? `<span class="blob" style="--h:${hue}"></span>` : `<span class="pin mini" style="--h:${hue};--c:${esc(chain.color)}"></span>`,
    };
  });
  if (state.loc) list.push({ id: "__me", lat: state.loc.lat, lng: state.loc.lng, prio: -1, force: true, noPick: true, cls: "me", html: '<span class="me-dot"></span>', dotHtml: '<span class="me-dot"></span>' });
  mapObj.setMarkers(list);
  const key = [state.city, state.area, state.chain].join("|");
  if (mapFitKey !== key && rows.length) { mapFitKey = key; mapObj.fit(rows.map((r) => r.st), { animate: false }); }
  mapObj.draw();
}
function pickStation(id) {
  const st = stationById(id);
  if (!st) return;
  state.selected = id; state.open = null;
  buzz(10);
  render(false);
  if (mapObj) mapObj.flyTo(st.lat, st.lng, Math.max(mapObj.z, 13.5), 0.3, 600);
}

/* ---------- journal view ---------- */
function journalCharts(s) {
  if (!window.Charts || state.journal.length < 2) return "";
  const ru = state.lang === "ru";
  const byMonth = new Map();
  for (const e of state.journal) { const m = e.t.slice(0, 7); byMonth.set(m, (byMonth.get(m) || 0) + e.l * e.ppl); }
  const months = [...byMonth.keys()].sort().slice(-6);
  const MN = ru ? ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"] : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const items = months.map((m) => ({ label: MN[+m.slice(5) - 1], v: byMonth.get(m), tip: `${MN[+m.slice(5) - 1]} ${m.slice(0, 4)}: ${byMonth.get(m).toFixed(2)} €` }));
  let out = `<h3>${ru ? "Траты по месяцам" : "Spending by month"}</h3>${Charts.columns({ items, fmt: (v) => v.toFixed(0) })}`;
  const cons = s.newest.filter((e) => s.cons[e.id] != null).reverse();
  if (cons.length >= 2) {
    out += `<h3>${ru ? "Расход топлива" : "Consumption"}</h3>${Charts.line({ id: "cons", labels: cons.map((e) => e.t.slice(8, 10) + "." + e.t.slice(5, 7)), fmt: (v) => v.toFixed(1),
      hint: ru ? "Проведите по графику, чтобы увидеть расход по заправкам." : "Drag across the chart to read each fill-up.",
      series: [{ key: "c", name: ru ? "л/100 км" : "l/100 km", color: "#ffc247", vals: cons.map((e) => s.cons[e.id]), area: true }] })}`;
  }
  return out;
}

function renderJournal() {
  const s = journalStats();
  const f = state.jf;
  if (!f.date) f.date = rigaToday();
  const best = bestFor(state.fuel);
  const cards = state.journal.length === 0 ? "" : `<div class="jstats">
    <div style="--i:0"><small>${t("jCons")}</small><b>${s.avgCons != null ? roll(s.avgCons.toFixed(1), "jc") : "—"}</b><small>${t("consUnit")}</small></div>
    <div style="--i:1"><small>${t("jAvgPrice")}</small><b>${s.avgPrice != null ? roll(s.avgPrice.toFixed(3), "jp") : "—"}</b><small>€/${state.lang === "ru" ? "л" : "l"}</small></div>
    <div style="--i:2"><small>${t("jMonth")}</small><b>${roll(s.spend.toFixed(2), "jm")}</b><small>€</small></div>
  </div>`;
  const per100 = s.avgCons != null && s.avgPrice != null ? `<p class="sub">${t("jPer100")}: <b>${((s.avgCons * s.avgPrice)).toFixed(2)} €</b></p>` : "";
  const items = s.newest.map((e, i) => `<li class="jrow" style="--i:${Math.min(i, 10)}">
      <div><b>${esc(e.t.slice(8, 10) + "." + e.t.slice(5, 7) + "." + e.t.slice(0, 4))}</b>
        <span>${e.l.toFixed(2)} ${state.lang === "ru" ? "л" : "l"} × ${e.ppl.toFixed(3)} €${e.odo != null ? `, ${Math.round(e.odo)} ${t("km")}` : ""}${e.full ? "" : ", " + (state.lang === "ru" ? "не полный" : "partial")}</span></div>
      <div class="jr"><b>${(e.l * e.ppl).toFixed(2)} €</b>${s.cons[e.id] ? `<span class="cons">${s.cons[e.id].toFixed(1)} ${t("consUnit")}</span>` : ""}</div>
      <button class="icon-btn sm" data-act="jdel" data-v="${e.id}" aria-label="${t("jDel")}">${ICON.trash}</button>
    </li>`).join("");
  return `<section class="jview">
    <h2 style="margin-top:20px">${t("jH")}</h2><p class="sub">${t("jSub")}</p>
    ${cards}${per100}
    <div class="rv">${journalCharts(s)}</div>
    ${s.avgCons != null ? `<button class="chip" data-act="jusecons">${t("jUse")} (${s.avgCons.toFixed(1)})</button>` : ""}
    <form class="jform" data-act="jform" novalidate>
      <div class="field"><label for="jd">${t("jDate")}</label><input id="jd" type="date" data-act="jf" data-v="date" value="${esc(f.date)}"></div>
      <div class="field"><label for="jl">${t("jLiters")}</label><input id="jl" type="number" step="0.01" min="0" inputmode="decimal" data-act="jf" data-v="l" value="${esc(f.l)}" placeholder="0"></div>
      <div class="field"><label for="jpp">${t("jPrice")}</label><input id="jpp" type="number" step="0.001" min="0" inputmode="decimal" data-act="jf" data-v="ppl" value="${esc(f.ppl)}" placeholder="0.000"></div>
      <div class="field"><label for="jo">${t("jOdo")}</label><input id="jo" type="number" step="1" min="0" inputmode="numeric" data-act="jf" data-v="odo" value="${esc(f.odo)}" placeholder="0"></div>
      ${best ? `<button type="button" class="chip wide" data-act="jbest">${t("jBest")}: ${fmtPrice(best.price)} €</button>` : ""}
      <label class="toggle"><input type="checkbox" data-act="jfull" ${f.full ? "checked" : ""}><span>${t("jFull")}</span></label>
      <button type="submit" class="btn wide">${t("jAdd")}</button>
    </form>
    ${items ? `<ul class="jlist">${items}</ul><button class="more" data-act="jcsv">${t("jCsv")}</button>` : `<div class="empty"><b>${t("jH")}</b>${t("jEmpty")}</div>`}
  </section>`;
}

/* ---------- settings sheet ---------- */
let sheetFresh = false;
function renderSheet() {
  const fresh = sheetFresh; sheetFresh = false;
  const chains = state.data ? Object.entries(state.data.chains).filter(([slug]) => state.data.stations.some((s) => s.chain === slug)) : [];
  const counts = {};
  if (state.data) for (const s of state.data.stations) counts[s.chain] = (counts[s.chain] || 0) + 1;
  chains.sort((a, b) => counts[b[0]] - counts[a[0]]);
  return `<div class="scrim ${fresh ? "in" : ""}" data-act="closesheet"></div>
  <section class="sheet ${fresh ? "in" : ""}" role="dialog" aria-modal="true" aria-label="${t("settings")}">
    <div class="grab"></div>
    <div class="sh-head"><h2>${t("settings")}</h2><button class="icon-btn sm" data-act="closesheet" aria-label="${t("close")}">${ICON.close}</button></div>
    <div class="set-row"><span>${t("language")}</span><div class="seg inline" role="group">
      <button data-act="setlang" data-v="ru" aria-pressed="${state.lang === "ru"}">RU</button>
      <button data-act="setlang" data-v="en" aria-pressed="${state.lang === "en"}">EN</button></div></div>
    <div class="set-row"><span>${t("themeLabel")}</span><div class="seg inline" role="group">
      <button data-act="settheme" data-v="dark" aria-pressed="${state.theme === "dark"}">${t("dark")}</button>
      <button data-act="settheme" data-v="light" aria-pressed="${state.theme === "light"}">${t("light")}</button></div></div>
    <label class="set-row"><span>${t("haptics")}</span><input type="checkbox" class="sw" data-act="haptics" ${state.haptics ? "checked" : ""}></label>
    <h3>${t("discH")}</h3><p class="sub">${t("discHelp")}</p>
    <label class="set-row"><span>${t("discApply")}</span><input type="checkbox" class="sw" data-act="usedisc" ${state.useDisc ? "checked" : ""}></label>
    <div class="disc-list">${chains.map(([slug, c]) => `<label class="disc"><span><i class="dot" style="background:${esc(c.color)}"></i>${esc(c.name)}</span>
      <input type="number" step="0.5" min="0" max="30" inputmode="decimal" placeholder="0" data-act="disc" data-v="${esc(slug)}" value="${+state.disc[slug] > 0 ? esc(state.disc[slug]) : ""}"><small>¢/${state.lang === "ru" ? "л" : "l"}</small></label>`).join("")}</div>
  </section>`;
}

function renderCmpBar() {
  if (!state.cmp.length || state.cmpOpen || (state.view === "map" && state.selected && state.mapView !== "list")) return "";
  return `<div class="cmpbar"><button class="go" data-act="cmpopen" ${state.cmp.length < 2 ? "disabled" : ""}>${ICON.cmp}${t("cmpBtn")} · ${state.cmp.length}/3</button><button class="x" data-act="cmpclear" aria-label="${t("cmpClear")}">${ICON.close}</button></div>`;
}
function renderCompare() {
  const sts = state.cmp.map(stationById).filter(Boolean);
  const cols = sts.map((st) => {
    const cell = st.fuels[state.fuel];
    if (!cell) return { st, none: true };
    const disc = discOf(st.chain);
    const price = Math.round((cell.p - disc) * 1000) / 1000;
    const dist = state.loc ? haversineKm(state.loc, st) * ROAD_FACTOR : null;
    const L = Math.max(0, +state.liters || 0);
    const cost = dist != null && state.road ? price * (L + (2 * dist * state.consumption) / 100) : price * L;
    return { st, cell, price, dist, cost, exact: isExact(cell, st, state.fuel), chain: state.data.chains[st.chain], rel: reliability(st, cell, state.fuel) };
  });
  const ok = cols.filter((c) => !c.none);
  const best = ok.length ? Math.min(...ok.map((c) => c.price)) : null;
  const head = cols.map((c) => `<div class="cc head"><b><i class="dot" style="background:${esc(c.none ? "#888" : c.chain.color)}"></i>${esc(state.data.chains[c.st.chain].name)}</b><span>${esc(c.st.address)}</span></div>`).join("");
  const row = (label, fn) => `<div class="cl-lbl">${label}</div>${cols.map((c) => `<div class="cc">${c.none ? "—" : fn(c)}</div>`).join("")}`;
  const Lbl = state.lang === "ru" ? "л" : "l";
  const body = [
    row(t("cmpPrice"), (c) => `<b class="cp ${c.price === best ? "best" : ""}">${fmtPrice(c.price)}</b><small>€/${Lbl}</small>`),
    row(t("cmpVsBest"), (c) => c.price === best ? `<span class="tag good">★ ${t("cmpBest")}</span>` : `<span class="vsavg up">▲ +${((c.price - best) * 100).toFixed(1)} ${t("cents")}</span>`),
    row(`${t("cmpTank")} ${state.liters} ${Lbl}`, (c) => `<b>${c.cost.toFixed(2)} €</b>${c.cost - Math.min(...ok.map((x) => x.cost)) > 0.004 ? `<small>+${(c.cost - Math.min(...ok.map((x) => x.cost))).toFixed(2)} €</small>` : ""}`),
    state.loc ? row(t("cmpDist"), (c) => `${c.dist.toFixed(1)} ${t("km")}`) : "",
    row(t("cmpUpd"), (c) => c.cell.ch ? dayWord(c.cell).replace(/^[^ ]+ /, "") : "—"),
    row(t("cmpRel"), (c) => relBadge(c.rel)),
  ].join("");
  const others = FUEL_ORDER.filter((f) => f !== state.fuel && sts.some((st) => st.fuels[f]));
  const oth = others.length ? `<h3>${t("cmpOther")}</h3><div class="cmp-grid" style="--n:${cols.length}">${others.map((f) => `<div class="cl-lbl">${t("fuels")[f]}</div>${sts.map((st) => `<div class="cc">${st.fuels[f] ? `<b>${fmtPrice(st.fuels[f].p - discOf(st.chain))}</b>` : "—"}</div>`).join("")}`).join("")}</div>` : "";
  return `<div class="scrim in" data-act="cmpclose"></div>
  <section class="sheet cmp in" role="dialog" aria-modal="true" aria-label="${t("cmpH")}">
    <div class="grab"></div>
    <div class="sh-head"><h2>${t("cmpH")} · ${t("fuels")[state.fuel]}</h2><button class="icon-btn sm" data-act="cmpclose" aria-label="${t("close")}">${ICON.close}</button></div>
    ${sts.length < 2 ? `<p class="sub">${t("cmpNeed")}</p>` : `<div class="cmp-grid" style="--n:${cols.length}"><div></div>${head}${body}</div>${oth}`}
    <button class="btn ghost cmp-clear" data-act="cmpclear">${t("cmpClear")}</button>
  </section>`;
}

let navShown = 0;
function renderNav() {
  const items = [["prices", ICON.prices, t("navPrices")], ["map", ICON.map, t("navMap")], ["stats", ICON.stats, t("navStats")], ["journal", ICON.journal, t("navJournal")]];
  const idx = items.findIndex((i) => i[0] === state.view);
  return `<nav class="bnav" style="--idx:${navShown}" data-idx="${idx}" aria-label="Menu"><span class="ind"></span>${items.map(([v, ic, label]) =>
    `<button data-act="nav" data-v="${v}" ${state.view === v ? 'aria-current="page"' : ""}>${ic}<span>${label}</span></button>`).join("")}</nav>`;
}

function renderSkeleton() {
  return `<div class="left"><div class="tiles">${[0, 1, 2].map((i) => `<div class="tile sk" style="--i:${i}"></div>`).join("")}</div><div class="pylon sk-hero"></div></div>
  <p class="sub" style="margin-top:14px">${t("loading")}</p>`;
}

let pendingPop = null;
function render(anim = true) {
  const keepScroll = window.scrollY;
  const active = document.activeElement;
  let focusSel = null, caret = null;
  if (active && active.dataset && /^(liters|cons|q|jf|disc)$/.test(active.dataset.act || "")) {
    focusSel = `[data-act="${active.dataset.act}"]` + (active.dataset.v ? `[data-v="${active.dataset.v}"]` : "");
    try { caret = [active.selectionStart, active.selectionEnd]; } catch { caret = null; }
  }
  document.documentElement.lang = state.lang;
  if (state.data) {
    const present = presentFuels();
    if (present.length && !present.includes(state.fuel)) state.fuel = present[0];
  }
  let body;
  if (!state.data) body = state.loading ? renderSkeleton() : `<div class="empty"><b>${t("noDataH")}</b>${t("noDataT")}<button class="btn retry" data-act="refresh">${t("retry")}</button></div>`;
  else if (!state.data.stations.length) body = `<div class="empty"><b>${t("noDataH")}</b>${t("noDataT")}</div>`;
  else if (state.view === "map") body = renderMapView();
  else if (state.view === "stats") body = renderStats();
  else if (state.view === "journal") body = renderJournal();
  else body = renderPrices();
  app.innerHTML = `<div class="wrap v-${state.view} ${anim ? "enter" : ""}">${renderHeader()}${body}
    <footer class="foot"><p>${t("source")}</p></footer></div>${renderNav()}${renderCmpBar()}${state.sheet ? renderSheet() : ""}${state.cmpOpen ? renderCompare() : ""}`;
  document.body.classList.toggle("noscroll", state.sheet || state.cmpOpen);
  if (state.data && state.view === "map") attachMap();
  if (window.Charts) Charts.bindScrub(app, CHART_FMT);
  observeReveals();
  settleRolls();
  const navEl = app.querySelector(".bnav");
  if (navEl) { const to = +navEl.dataset.idx; requestAnimationFrame(() => requestAnimationFrame(() => navEl.style.setProperty("--idx", to))); navShown = to; }
  window.scrollTo(0, keepScroll);
  if (focusSel) {
    const el = app.querySelector(focusSel);
    if (el) { el.focus({ preventScroll: true }); try { if (caret && caret[0] != null) el.setSelectionRange(caret[0], caret[1]); } catch { /* number inputs */ } }
  }
  if (pendingPop) {
    app.querySelectorAll(`.heart[data-v="${CSS.escape(pendingPop)}"]`).forEach((h) => h.classList.add("pop"));
    pendingPop = null;
  }
}

/* ---------- data ---------- */
async function getJson(name, bust) {
  const res = await fetch(`data/${name}.json${bust ? "?t=" + Date.now() : ""}`, { cache: "no-cache" });
  if (!res.ok) throw new Error(name + " " + res.status);
  return res.json();
}
async function load(bust = false, anim = true, keepBusy = false) {
  state.loading = true;
  render(false);
  const [data, history, oil] = await Promise.allSettled([getJson("prices", bust), getJson("history", bust), getJson("oil", bust)]);
  if (data.status === "fulfilled") state.data = data.value;
  if (history.status === "fulfilled") state.history = history.value;
  if (oil.status === "fulfilled") state.oil = oil.value;
  if (state.data && state.city !== "all" && !state.data.cities.some((c) => c.slug === state.city)) state.city = "riga";
  if (keepBusy) { render(false); await new Promise((r) => setTimeout(r, 700)); }
  state.loading = false;
  render(anim);
  saveSnap();
}

/* ---------- actions ---------- */
let geoWatch = null, geoTimer = 0;
function locate() {
  if (!navigator.geolocation) { toast(t("locFail")); return; }
  if (state.locating) return;
  state.locating = true;
  toast(t("locating"));
  buzz(10);
  render(false);
  let got = false;
  const finish = (ok) => {
    if (geoWatch != null) navigator.geolocation.clearWatch(geoWatch);
    geoWatch = null; clearTimeout(geoTimer);
    state.locating = false;
    if (!ok) toast(t("locFail"));
    render(false);
  };
  geoTimer = setTimeout(() => finish(got), 9000);
  // watchPosition gives the first (coarse) fix fast and then refines it; no cached position is reused.
  geoWatch = navigator.geolocation.watchPosition(
    (pos) => {
      const first = !got;
      got = true;
      state.loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy };
      state.road = true;
      if (first) buzz(12);
      if (pos.coords.accuracy <= 150) { finish(true); } else render(false);
      if (first && state.view === "map" && mapObj) mapObj.flyTo(state.loc.lat, state.loc.lng, 13, 0.5, 700);
    },
    () => { if (!got) finish(false); },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 9000 }
  );
}
let reloadOnUpdate = false;
async function refreshNow() {
  if (state.loading) return;
  buzz(10);
  reloadOnUpdate = true;
  try { const reg = await navigator.serviceWorker?.getRegistration(); if (reg) reg.update(); } catch { /* ignore */ }
  const t0 = Date.now();
  await load(true, false, true);
  setTimeout(() => { reloadOnUpdate = false; }, 4000);
  const left = 800 - (Date.now() - t0);
  if (left > 0) await new Promise((r) => setTimeout(r, left));
  if (state.data) {
    const hhmm = new Intl.DateTimeFormat("ru-RU", { timeZone: "Europe/Riga", hour: "2-digit", minute: "2-digit" }).format(new Date(state.data.generated_at));
    toast(`${t("refreshed")} ${hhmm}`);
  }
}
const VIEW_ORDER = ["prices", "map", "stats", "journal"];
function setView(v) {
  if (state.view === v) return;
  const dir = VIEW_ORDER.indexOf(v) > VIEW_ORDER.indexOf(state.view) ? "fwd" : "back";
  const apply = () => {
    state.view = v;
    state.sheet = false;
    state.selected = null;
    rolled.clear();
    render(true);
    window.scrollTo(0, 0);
  };
  buzz(6);
  if (document.startViewTransition && !REDUCE_MOTION) {
    document.documentElement.dataset.vt = dir;
    const vt = document.startViewTransition(apply);
    vt.finished.finally(() => { delete document.documentElement.dataset.vt; });
  } else apply();
}
async function shareStation(id) {
  const st = stationById(id);
  const cell = st && st.fuels[state.fuel];
  if (!cell) return;
  const text = `${t("sharePrefix")} ${t("fuels")[state.fuel]}: ${fmtPrice(cell.p)} € — ${state.data.chains[st.chain].name}, ${st.address}`;
  const url = location.href.split("#")[0].split("?")[0];
  try {
    if (navigator.share) { await navigator.share({ title: "Degvielas Radars", text, url }); return; }
  } catch (e) { if (e && e.name === "AbortError") return; }
  try { await navigator.clipboard.writeText(`${text} ${url}`); toast(t("copied")); } catch { toast(text); }
}
function toggleFav(id) {
  const i = state.favs.indexOf(id);
  if (i < 0) { state.favs.push(id); toast(t("favAdded")); pendingPop = id; } else { state.favs.splice(i, 1); toast(t("favRemoved")); }
  store.set("favs", state.favs);
  if (!state.favs.length) state.favOnly = false;
  buzz(18);
  saveSnap();
  render(false);
}
function addFill() {
  const f = state.jf;
  const l = parseFloat(String(f.l).replace(",", ".")), ppl = parseFloat(String(f.ppl).replace(",", "."));
  const odo = f.odo === "" ? null : parseFloat(String(f.odo).replace(",", "."));
  if (!(l > 0) || !(ppl > 0)) { toast(t("jBad")); buzz([30, 40, 30]); return; }
  state.journal.push({ id: Date.now(), t: f.date || rigaToday(), l, ppl, odo: Number.isFinite(odo) ? odo : null, full: !!f.full });
  store.set("journal", state.journal);
  state.jf = { date: "", l: "", ppl: "", odo: "", full: true };
  toast(t("jSaved"));
  buzz(20);
  render(false);
}
function csvText() {
  const rows = [...state.journal].sort((a, b) => a.t.localeCompare(b.t));
  return ["date,liters,price_eur_per_l,total_eur,odometer_km,full_tank"]
    .concat(rows.map((e) => [e.t, e.l, e.ppl, (e.l * e.ppl).toFixed(2), e.odo ?? "", e.full ? 1 : 0].join(","))).join("\n");
}

/* ---------- events ---------- */
app.addEventListener("click", (e) => {
  const tipEl = e.target.closest("[data-tip]");
  if (tipEl && tipEl.dataset.tip) { toast(tipEl.dataset.tip); buzz(8); return; }
  const el = e.target.closest("[data-act]");
  if (!el || el.tagName === "SELECT" || el.tagName === "INPUT" || el.tagName === "FORM") return;
  if (el.dataset.act !== "row" && el.dataset.act !== "share" && e.target.closest("a")) return;
  const v = el.dataset.v;
  let anim = true;
  switch (el.dataset.act) {
    case "nav": setView(v); return;
    case "cmp": {
      const i = state.cmp.indexOf(v);
      if (i >= 0) state.cmp.splice(i, 1);
      else if (state.cmp.length >= 3) { toast(t("cmpMax")); return; }
      else state.cmp.push(v);
      buzz(8); anim = false; break;
    }
    case "cmpopen": state.cmpOpen = true; buzz(6); render(false); return;
    case "cmpclose": state.cmpOpen = false; render(false); return;
    case "cmpclear": state.cmp = []; state.cmpOpen = false; buzz(6); render(false); return;
    case "sheet": state.sheet = true; sheetFresh = true; buzz(6); render(false); return;
    case "closesheet": state.sheet = false; render(false); return;
    case "setlang": state.lang = v; store.set("lang", v); render(false); return;
    case "settheme": state.theme = v; store.set("theme", v); applyTheme(); render(false); return;
    case "refresh": refreshNow(); return;
    case "fuel": state.fuel = v; store.set("fuel", v); state.showAll = false; state.open = null; buzz(8); break;
    case "sort":
      if (v === "near" && !state.loc) { state.sort = "near"; locate(); return; }
      state.sort = v; buzz(8); flip(() => render(false)); return;
    case "goarea": state.area = v; state.view = "prices"; state.showAll = false; mapFitKey = ""; rolled.clear(); buzz(10); render(true); window.scrollTo(0, 0); return;
    case "gocity": state.city = v; store.set("city", v); state.area = null; state.chain = null; state.view = "prices"; mapFitKey = ""; rolled.clear(); buzz(10); render(true); window.scrollTo(0, 0); return;
    case "trange": state.trendRange = v; anim = true; break;
    case "mheat": state.heat = !state.heat; buzz(8); anim = false; break;
    case "mview": state.mapView = v; store.set("mapview", v); anim = false; mapFitKey = ""; break;
    case "onmap": {
      const st = stationById(v); if (!st) return;
      state.selected = v; state.open = null; if (state.mapView === "list") { state.mapView = "split"; store.set("mapview", "split"); mapFitKey = "x"; }
      buzz(10); render(false); window.scrollTo({ top: 0, behavior: "smooth" });
      if (mapObj) mapObj.flyTo(st.lat, st.lng, Math.max(mapObj.z, 13.5), 0.3, 600);
      return;
    }
    case "mapmode": state.mapMode = v; store.set("mapmode", v); anim = false; break;
    case "mode": state.mode = v; store.set("mode", v); break;
    case "area": state.area = v || null; state.showAll = false; mapFitKey = ""; break;
    case "chain": state.chain = state.chain === v ? null : v; state.showAll = false; mapFitKey = ""; break;
    case "more": state.showAll = !state.showAll; anim = false; break;
    case "row": state.open = state.open === v ? null : v; anim = false; break;
    case "near": locate(); return;
    case "noloc": state.loc = null; state.road = false; state.radius = null; buzz(8); break;
    case "fav": toggleFav(v); return;
    case "favonly": state.favOnly = !state.favOnly; state.showAll = false; buzz(8); break;
    case "favgo": state.selected = v; state.view = "map"; state.open = null; rolled.clear(); render(true); window.scrollTo(0, 0);
      { const st = stationById(v); if (st && mapObj) setTimeout(() => mapObj.flyTo(st.lat, st.lng, 14, 0.3, 700), 60); }
      return;
    case "discchip": state.useDisc = !state.useDisc; store.set("useDisc", state.useDisc); break;
    case "radius": state.radius = v ? +v : null; state.showAll = false; buzz(8); break;
    case "share": shareStation(v); return;
    case "mzoom": if (mapObj) mapObj.zoomBy(+v); buzz(5); return;
    case "mfit": if (mapObj) { const rows = mapRows(); if (rows.length) mapObj.fit(rows.map((r) => r.st), { animate: true }); } return;
    case "mme": if (state.loc && mapObj) mapObj.flyTo(state.loc.lat, state.loc.lng, 14, 0.5, 600); else locate(); return;
    case "mclose": state.selected = null; render(false); return;
    case "jbest": { const b = bestFor(state.fuel); if (b) { state.jf.ppl = b.price.toFixed(3); buzz(8); render(false); } return; }
    case "jdel": state.journal = state.journal.filter((x) => String(x.id) !== v); store.set("journal", state.journal); buzz(12); render(false); return;
    case "jusecons": {
      const s = journalStats();
      if (s.avgCons != null) { state.consumption = Math.round(s.avgCons * 10) / 10; store.set("consumption", state.consumption); toast(t("jUsed")); buzz(12); }
      return;
    }
    case "jcsv": navigator.clipboard.writeText(csvText()).then(() => toast(t("exportHint")), () => toast(csvText().slice(0, 120))); return;
    case "install": {
      const evt = installPrompt;
      if (evt) { evt.prompt(); evt.userChoice.finally(() => { installPrompt = null; render(false); }); }
      return;
    }
    case "later": store.set("installHidden", Date.now()); anim = false; break;
    default: return;
  }
  render(anim);
});
app.addEventListener("change", (e) => {
  const el = e.target;
  const act = el.dataset.act;
  if (act === "city") {
    state.city = el.value; state.area = null; state.chain = null; state.showAll = false; state.selected = null; store.set("city", state.city);
    buzz(8); render(true); saveSnap();
  }
  if (act === "road") { state.road = el.checked; render(false); }
  if (act === "jfull") state.jf.full = el.checked;
  if (act === "haptics") { state.haptics = el.checked; store.set("haptics", el.checked); if (el.checked) buzz(15); }
  if (act === "usedisc") { state.useDisc = el.checked; store.set("useDisc", el.checked); }
});
app.addEventListener("input", (e) => {
  const el = e.target;
  const act = el.dataset.act;
  if (act === "q") { state.q = el.value; state.showAll = true; render(false); return; }
  if (act === "jf") { state.jf[el.dataset.v] = el.value; return; }
  const n = parseFloat(String(el.value).replace(",", "."));
  if (act === "disc") {
    if (n > 0) state.disc[el.dataset.v] = n; else delete state.disc[el.dataset.v];
    store.set("disc", state.disc);
    return;
  }
  if (act === "fpm" && n > 0) { state.fpm = n; store.set("fpm", n); updateSavings(); return; }
  if (act === "liters" && n > 0) { state.liters = n; store.set("liters", n); render(false); }
  if (act === "cons" && n > 0) { state.consumption = n; store.set("consumption", n); render(false); }
});
function spotlight(e) {
  const g = e.target.closest && e.target.closest(".tile,.fav,.ins,.sum,.oil>div,.jstats>div,.save-card,.cta,.jform");
  if (!g) return;
  const r = g.getBoundingClientRect();
  g.style.setProperty("--mx", e.clientX - r.left + "px");
  g.style.setProperty("--my", e.clientY - r.top + "px");
}
app.addEventListener("pointermove", spotlight, { passive: true });
app.addEventListener("pointerdown", spotlight, { passive: true });
app.addEventListener("submit", (e) => { e.preventDefault(); addFill(); });
window.addEventListener("keydown", (e) => { if (e.key === "Escape" && (state.sheet || state.cmpOpen)) { state.sheet = false; state.cmpOpen = false; render(false); } });
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installPrompt = e; if (state.data) render(false); });
window.addEventListener("appinstalled", () => { state.installed = true; installPrompt = null; render(false); });
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && state.data && !state.sheet) {
    const ageMin = (Date.now() - Date.parse(state.data.generated_at)) / 60000;
    if (ageMin > 15) load(true, false); else render(false);
  }
});

/* ---------- motion layer: orbs, parallax, 3D tilt, scroll reveal, FLIP ---------- */
const REDUCE_MOTION = matchMedia("(prefers-reduced-motion: reduce)").matches;
(function motion() {
  const scene = document.createElement("div");
  scene.className = "scene"; scene.setAttribute("aria-hidden", "true");
  let dropN = 0;
  const DROP = (n, cls) => {
    const k = "d" + dropN++;
    const P = "M50 2C55 24 90 52 90 87A40 40 0 0 1 10 87C10 52 45 24 50 2Z";
    return `<svg class="drop ${cls}" viewBox="0 0 100 130" ${n}><defs>
      <radialGradient id="${k}b" cx=".42" cy=".7" r=".72"><stop offset="0" stop-color="#050302" stop-opacity=".97"/><stop offset=".6" stop-color="#150c05" stop-opacity=".92"/><stop offset=".9" stop-color="#8a4a12" stop-opacity=".75"/><stop offset="1" stop-color="#ffc06a" stop-opacity=".9"/></radialGradient>
      <linearGradient id="${k}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00e5c3" stop-opacity=".0"/><stop offset=".35" stop-color="#00e5c3" stop-opacity=".35"/><stop offset=".65" stop-color="#ff7ab8" stop-opacity=".3"/><stop offset="1" stop-color="#ffb02e" stop-opacity=".0"/></linearGradient>
      <radialGradient id="${k}g" cx=".5" cy="1" r=".75"><stop offset="0" stop-color="#ff9d1a" stop-opacity=".8"/><stop offset="1" stop-color="#ff9d1a" stop-opacity="0"/></radialGradient>
      <clipPath id="${k}c"><path d="${P}"/></clipPath>
      <filter id="${k}f" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter></defs>
      <path d="${P}" fill="url(#${k}b)"/>
      <g clip-path="url(#${k}c)"><ellipse cx="30" cy="120" rx="30" ry="22" fill="#ff7a1a" opacity=".3" filter="url(#${k}f)"/><ellipse cx="72" cy="122" rx="28" ry="20" fill="#ffd166" opacity=".26" filter="url(#${k}f)"/><ellipse cx="50" cy="128" rx="40" ry="24" fill="url(#${k}g)"/>
        <ellipse cx="33" cy="76" rx="6" ry="22" transform="rotate(12 33 76)" fill="#fff" opacity=".42" filter="url(#${k}f)"/></g>
      <path d="${P}" fill="none" stroke="#ffd9a0" stroke-opacity=".5" stroke-width="1.2"/>
      <ellipse cx="40" cy="52" rx="2.2" ry="3.4" transform="rotate(26 40 52)" fill="#fff" opacity=".7"/></svg>`;
  };
  // Deterministic pseudo-random so the skyline is the same on every load
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  function skyline(seed, G, sc, density, W = 1000, far = false) {
    const r = rng(seed), R = (a, b) => a + (b - a) * r();
    let fill = "", line = "", lights = "";
    const f = (v) => v.toFixed(1);
    const rect = (x, y, w, h) => `M${f(x)} ${f(y)}h${f(w)}v${f(h)}h${f(-w)}z`;
    const lattice = (x, yTop, yBot, w, step) => {
      let d = `M${f(x)} ${f(yBot)}V${f(yTop)}M${f(x + w)} ${f(yBot)}V${f(yTop)}`, up = true;
      for (let y = yBot; y > yTop + step; y -= step) { d += `M${f(up ? x : x + w)} ${f(y)}L${f(up ? x + w : x)} ${f(y - step)}`; up = !up; }
      return d;
    };
    const drum = (x, y, w, h) => { fill += `M${f(x + h / 2)} ${f(y)}h${f(w - h)}a${f(h / 2)} ${f(h / 2)} 0 0 1 0 ${f(h)}h${f(-(w - h))}a${f(h / 2)} ${f(h / 2)} 0 0 1 0 ${f(-h)}z`; };
    // A distillation column: stepped body, dome, vent, platforms with railings, caged ladder
    const column = (x, w, h) => {
      const w2 = w * R(.7, .88), x2 = x + (w - w2) / 2, split = h * R(.42, .6);
      fill += rect(x, G - split, w, split) + rect(x2, G - h + 3 * sc, w2, h - split - 3 * sc);
      fill += `M${f(x)} ${f(G - split)}L${f(x2)} ${f(G - split - 3 * sc)}H${f(x2 + w2)}L${f(x + w)} ${f(G - split)}Z`;
      fill += `M${f(x2)} ${f(G - h + 3 * sc)}Q${f(x2 + w2 / 2)} ${f(G - h - 3.5 * sc)} ${f(x2 + w2)} ${f(G - h + 3 * sc)}Z`;
      fill += rect(x2 + w2 / 2 - .7 * sc, G - h - 10 * sc, 1.4 * sc, 8 * sc);
      if (!far) {
        for (let y = G - h * .9; y < G - 8 * sc; y += R(12, 21) * sc) {
          const lower = y > G - split, ww = lower ? w : w2, xx = lower ? x : x2;
          fill += rect(xx - 2.6 * sc, y, ww + 5.2 * sc, 1.3 * sc);
          line += `M${f(xx - 2.6 * sc)} ${f(y)}v${f(-2.6 * sc)}h${f(ww + 5.2 * sc)}v${f(2.6 * sc)}`;
        }
        if (r() < .85) line += lattice(r() < .5 ? x - 5 * sc : x + w + .5 * sc, G - h * .86, G - 2 * sc, 4.5 * sc, 4.6 * sc);
      }
      return { cx: x + w / 2, top: G - h, w };
    };
    const frame = (x, w, h) => { // steel structure with drums on top
      const bay = R(9, 14) * sc; let d = "";
      for (let px = x; px <= x + w + .1; px += bay) d += `M${f(px)} ${G}V${f(G - h)}`;
      const lv = R(13, 19) * sc; let k = 0;
      for (let y = G - lv; y > G - h; y -= lv, k++) {
        d += `M${f(x)} ${f(y)}H${f(x + w)}`;
        for (let px = x, j = 0; px + bay <= x + w + .1; px += bay, j++) d += (j + k) % 2 ? `M${f(px)} ${f(y + lv)}L${f(px + bay)} ${f(y)}` : `M${f(px + bay)} ${f(y + lv)}L${f(px)} ${f(y)}`;
      }
      d += `M${f(x)} ${f(G - h)}H${f(x + w)}`; line += d;
      fill += rect(x, G - h - 1.6 * sc, w, 1.6 * sc);
      const nd = 1 + Math.floor(r() * 2); let dx = x + 2 * sc;
      for (let i = 0; i < nd && dx < x + w - 14 * sc; i++) { const dw = R(16, 28) * sc, dh = R(6, 9) * sc; drum(dx, G - h - 1.6 * sc - dh, dw, dh); dx += dw + 3 * sc; }
    };
    let x = -20;
    while (x < W + 20) {
      const pick = far ? (r() < .45 ? .1 : r() < .6 ? .7 : .9) : r();
      if (pick < .4) { // tower group with pipe runs
        const n = 2 + Math.floor(r() * 3), cols = []; let cx = x;
        for (let i = 0; i < n; i++) { const w = R(11, 25) * sc, h = R(78, 172) * sc * (far ? .8 : 1); cols.push(column(cx, w, h)); cx += w + R(5, 11) * sc; }
        if (!far) for (let i = 1; i < cols.length; i++) {
          const a_ = cols[i - 1], b_ = cols[i], y1 = Math.max(a_.top, b_.top) + R(14, 40) * sc, px = (a_.cx + a_.w / 2 + b_.cx - b_.w / 2) / 2;
          fill += rect(px - 1.1 * sc, y1, 2.2 * sc, G - y1);
          line += `M${f(a_.cx + a_.w / 2)} ${f(y1 + 3 * sc)}H${f(px)}M${f(px)} ${f(y1 + 3 * sc)}H${f(b_.cx - b_.w / 2)}`;
          if (r() < .6) line += `M${f(a_.cx)} ${f(a_.top + 5 * sc)}V${f(a_.top - 4 * sc)}H${f(b_.cx)}V${f(b_.top - 8 * sc)}`;
        }
        x = cx + R(0, 8) * sc;
      } else if (pick < .62 && !far) { // steel structure
        const w = R(34, 72) * sc, h = R(48, 98) * sc; frame(x, w, h); x += w + R(0, 8) * sc;
      } else if (pick < .72) { // tanks
        const n = 1 + Math.floor(r() * 3); let cx = x;
        for (let i = 0; i < n; i++) { const w = R(34, 70) * sc, h = R(18, 34) * sc; fill += `M${f(cx)} ${G}V${f(G - h)}Q${f(cx + w / 2)} ${f(G - h - 8 * sc)} ${f(cx + w)} ${f(G - h)}V${G}Z`; if (!far) line += `M${f(cx + w)} ${f(G - h)}l${f(3 * sc)} 0v${f(h)}M${f(cx + w * .1)} ${f(G - h * .9)}L${f(cx + w * .9)} ${f(G - 2)}`; cx += w + R(3, 9) * sc; }
        x = cx + R(0, 6) * sc;
      } else if (pick < .8) { // exchangers
        const n = 2 + Math.floor(r() * 2); let cy = G;
        const w = R(26, 44) * sc, h = R(6, 9) * sc;
        for (let i = 0; i < n; i++) { cy -= h + 4 * sc; drum(x, cy, w, h); fill += rect(x + w * .2, cy + h, 1.8 * sc, 4 * sc) + rect(x + w * .75, cy + h, 1.8 * sc, 4 * sc); }
        fill += rect(x + w * .2, G - 2, 1.8 * sc, 2) ; x += w + R(2, 10) * sc;
      } else if (pick < .87) { // spheres
        const rad = R(11, 19) * sc, cy = G - rad - 9 * sc;
        fill += `M${f(x)} ${f(cy)}a${f(rad)} ${f(rad)} 0 1 0 ${f(rad * 2)} 0a${f(rad)} ${f(rad)} 0 1 0 ${f(-rad * 2)} 0Z`;
        line += `M${f(x + rad * .5)} ${f(cy + rad * .8)}L${f(x + rad * .3)} ${G}M${f(x + rad * 1.5)} ${f(cy + rad * .8)}L${f(x + rad * 1.7)} ${G}M${f(x + rad)} ${f(cy + rad)}V${G}`;
        x += rad * 2 + R(2, 12) * sc;
      } else if (pick < .94) { // tall stack with bands
        const w = R(6, 10) * sc, h = R(150, 215) * sc;
        fill += `M${f(x)} ${G}L${f(x + w * .22)} ${f(G - h)}H${f(x + w * .78)}L${f(x + w)} ${G}Z`;
        for (let y = G - h + 6 * sc; y < G - 10; y += R(24, 38) * sc) fill += rect(x + w * .1, y, w * .8, 2.2 * sc);
        if (!far) line += lattice(x + w + .8 * sc, G - h * .8, G - 2 * sc, 3.6 * sc, 4.2 * sc);
        if (density > .5) lights += `<circle class="warn" cx="${f(x + w / 2)}" cy="${f(G - h - 2)}" r="${f(.9 * sc + .3)}"/>`;
        x += w + R(8, 22) * sc;
      } else { // cooling towers
        const w = R(40, 64) * sc, h = R(56, 88) * sc;
        fill += `M${f(x)} ${G}C${f(x + w * .25)} ${f(G - h * .45)} ${f(x + w * .2)} ${f(G - h * .72)} ${f(x + w * .1)} ${f(G - h)}H${f(x + w * .9)}C${f(x + w * .8)} ${f(G - h * .72)} ${f(x + w * .75)} ${f(G - h * .45)} ${f(x + w)} ${G}Z`;
        if (far) for (let i = 0; i < 3; i++) { const pr = (9 + i * 5) * sc; fill += `M${f(x + w * .5 - pr)} ${f(G - h - 6 * sc - i * 12 * sc)}a${f(pr)} ${f(pr * .62)} 0 1 0 ${f(pr * 2)} 0a${f(pr)} ${f(pr * .62)} 0 1 0 ${f(-pr * 2)} 0Z`; }
        x += w + R(2, 14) * sc;
      }
    }
    // pipe rack along the base and a low plinth
    if (!far) {
      for (let px = -10; px < W; px += 230) {
        const w = R(120, 210) * sc, y = G - 14 * sc;
        fill += rect(px, y, w, 2 * sc) + rect(px, y + 5 * sc, w, 1.6 * sc);
        for (let k = px; k < px + w; k += 20 * sc) { fill += rect(k, y, 1.8 * sc, G - y); line += `M${f(k)} ${f(y + 6 * sc)}L${f(k + 20 * sc)} ${G}`; }
      }
    }
    fill += rect(-60, G - 3 * sc, W + 120, 3 * sc);
    if (density > .6) for (let i = 0; i < 30; i++) lights += `<circle class="lt" cx="${f(R(0, W))}" cy="${f(G - R(4, 90) * sc)}" r=".7"/>`;
    return { fill, line, lights };
  }
  function buildRefinery() {
    const far = skyline(11, 214, .6, .5, 1000, true), mid = skyline(27, 233, .78, .65), near = skyline(5, 253, 1.05, .85);
    const layer = (cls, o, extra = "", ground = "") => `<g class="rl ${cls}"><path d="${ground}${o.fill}" class="rf"/><path d="${o.line}" class="rs" fill="none"/>${o.lights}${extra}</g>`;
    const fog = (y, h, o) => `<rect x="-300" y="${y}" width="1600" height="${h}" fill="url(#fog)" opacity="${o}"/>`;
    return `<svg class="refinery" viewBox="0 0 1000 260" preserveAspectRatio="xMidYMax meet"><defs>
      <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--fog)" stop-opacity="0"/><stop offset=".6" stop-color="var(--fog)" stop-opacity=".9"/><stop offset="1" stop-color="var(--fog)" stop-opacity="1"/></linearGradient>
      <filter id="fb" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation=".9"/></filter><radialGradient id="flare"><stop offset="0" stop-color="#ffb35c" stop-opacity=".7"/><stop offset=".15" stop-color="#ff8a3a" stop-opacity=".35"/><stop offset="1" stop-color="#ff6a2a" stop-opacity="0"/></radialGradient></defs>
            ${layer("l-far", far)}${fog(176, 60, .75)}
      ${layer("l-mid", mid)}<g class="rl l-mid flareg"><g transform="translate(-180 0)"><circle class="flare-glow" cx="740.5" cy="66" r="120" fill="url(#flare)"/>
        <circle class="fa" cx="740.5" cy="84" r=".5" fill="none"/><g class="flarestack"><rect x="739.6" y="86" width="1.8" height="146"/><rect x="738" y="86" width="5" height="2"/></g>
        <g class="smoke"><circle class="sm s1" cx="747" cy="24" r="7"/><circle class="sm s2" cx="750" cy="18" r="9"/><circle class="sm s3" cx="745" cy="26" r="6"/></g>
        <g class="flm"><g class="fl body"><path d="M733.5 82C731.5 75 735 68 733.6 60C732.6 54 736.6 50 735.4 42C740 47 741 39 745.6 31C745.4 41 752 45 750 53C754.4 51 752.6 61 752.4 67C754.4 73 749.4 78 747.4 82Z" fill="#ff4d12" opacity=".92" filter="url(#fb)"/></g>
        <g class="fl t1"><path d="M737 81C735 69 738 59 741.5 45C742.5 56 746 66 745 81Z" fill="#ff8a24"/></g>
        <g class="fl t2"><path d="M742 81C743 71 748 63 757 56C753 66 752 74 749 81Z" fill="#ff7a1c"/></g>
        <g class="fl t3"><path d="M735.5 81C734.5 75 733.5 71 731.5 68C735.5 68 737.5 73 738.5 81Z" fill="#ff9a30"/></g>
        <g class="fl t4"><path d="M744 80C746.5 72 751 65 757.5 59C757 68 754 76 749 82Z" fill="#ffb030" opacity=".85"/></g>
        <g class="fl core"><ellipse cx="741" cy="77.5" rx="4.2" ry="6" fill="#ffd77a"/><ellipse cx="741" cy="79" rx="2.8" ry="3.6" fill="#fff6dc"/></g></g>
        <circle class="em e1" cx="745" cy="40" r=".9"/><circle class="em e2" cx="749" cy="46" r=".7"/><circle class="em e3" cx="742" cy="38" r=".8"/></g></g>
      ${fog(206, 46, .65)}
      ${layer("l-near", near, "", "M-400 252H1400V700H-400Z")}${fog(236, 30, .95)}
    </svg>`;
  }
  const refinery = buildRefinery();
  const sparks = REDUCE_MOTION ? "" : `<div class="sparks">${Array.from({ length: 18 }, (_, i) => {
    const r = (n) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
    return `<i style="left:${(r(1) * 100).toFixed(1)}%;--s:${(1.5 + r(2) * 2.5).toFixed(1)}px;--t:${(26 + r(3) * 24).toFixed(0)}s;--dl:${(-r(4) * 40).toFixed(1)}s;--dx:${((r(5) - .5) * 60).toFixed(0)}px;--o:${(.35 + r(6) * .4).toFixed(2)}"></i>`;
  }).join("")}</div>`;
  scene.innerHTML = `<div class="haze"></div>` + refinery + `<div class="ground"></div>` + sparks +
    DROP('style="--w:230px;left:-96px;top:34vh;--fx:46;--fy:.5;--b:2.2px;--r:-14deg;--d:7s"', "near") +
    DROP('style="--w:200px;right:-60px;top:10vh;--fx:-40;--fy:.42;--b:1.8px;--r:12deg;--d:9s"', "near") +
    DROP('style="--w:104px;left:66%;top:36vh;--fx:20;--fy:.2;--b:0px;--r:6deg;--d:8s"', "mid") +
    DROP('style="--w:80px;left:6%;top:30vh;--fx:16;--fy:.16;--b:0px;--r:-8deg;--d:10s"', "mid") +
    DROP('style="--w:48px;left:42%;top:19vh;--fx:7;--fy:.07;--b:.6px;--r:4deg;--d:11s"', "far") +
    DROP('style="--w:38px;right:12%;top:60vh;--fx:5;--fy:.05;--b:.8px;--r:-5deg;--d:12s"', "far") +
    DROP('style="--w:30px;left:30%;top:46vh;--fx:4;--fy:.04;--b:1px;--r:9deg;--d:13s"', "far");
  document.body.appendChild(scene);

  // Real-looking flare: a small canvas particle fire (additive glowing sprites that rise, cool from white to red,
  // lean in the wind and lick). The SVG flame stays as the fallback for reduced motion.
  (() => {
    if (REDUCE_MOTION) return;
    const anchor = scene.querySelector(".fa"), svgEl = scene.querySelector(".refinery");
    if (!anchor || !svgEl) return;
    const CW = 190, CH = 300, BX = 70, BY = 240, dpr = Math.min(devicePixelRatio || 1, 2);
    const cv = document.createElement("canvas");
    cv.className = "flame-cv"; cv.width = CW * dpr; cv.height = CH * dpr;
    cv.style.width = CW + "px"; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    scene.insertBefore(cv, scene.querySelector(".sparks"));
    scene.classList.add("live-flame");
    const stops = [[0, [255, 240, 190]], [.1, [255, 214, 120]], [.34, [255, 150, 40]], [.64, [232, 70, 14]], [1, [100, 22, 8]]];
    const colour = (t) => {
      for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) {
        const [t0, c0] = stops[i - 1], [t1, c1] = stops[i], k = (t - t0) / (t1 - t0);
        return c0.map((v, j) => Math.round(v + (c1[j] - v) * k));
      }
      return stops[stops.length - 1][1];
    };
    const N = 32;
    const sprites = Array.from({ length: N }, (_, i) => {
      const c = document.createElement("canvas"); c.width = c.height = 64;
      const g = c.getContext("2d"), [r, gg, b] = colour(i / (N - 1));
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, `rgba(${r},${gg},${b},1)`); gr.addColorStop(.35, `rgba(${r},${gg},${b},.55)`); gr.addColorStop(1, `rgba(${r},${gg},${b},0)`);
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      return c;
    });
    const parts = [], smoke = [];
    let last = 0, boost = 0, nextBurst = 0.6, smokeAcc = 0, spawnAcc = 0, show = true;
    const rnd = Math.random;
    function frame(now) {
      requestAnimationFrame(frame);
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (dt <= 0) return;
      const r = anchor.getBoundingClientRect();
      show = r.left > -120 && r.left < innerWidth + 120 && r.top > -200 && r.top < innerHeight + 60;
      cv.style.display = show ? "" : "none";
      if (!show) return;
      const k = Math.max(.6, svgEl.getBoundingClientRect().width / 1000);
      cv.style.transform = `translate(${(r.left + r.width / 2 - BX).toFixed(1)}px,${(r.top + r.height / 2 - BY + 2).toFixed(1)}px)`;
      const t = now / 1000, light = document.documentElement.dataset.theme === "light";
      nextBurst -= dt; if (nextBurst <= 0) { boost = 1; nextBurst = .5 + rnd() * 1.4; }
      boost = Math.max(0, boost - dt * 2.2);
      const rate = 170 * (1 + boost * .9);
      spawnAcc += rate * dt;
      while (spawnAcc >= 1) {
        spawnAcc--;
        parts.push({ x: BX + (rnd() - .5) * 14 * k, y: BY - rnd() * 4 * k, vx: (rnd() - .5) * 26 * k, vy: -(48 + rnd() * 62 + boost * 40) * k, life: .6 + rnd() * .8, age: 0, size: (6 + rnd() * 6) * k, ph: rnd() * 6.28 });
      }
      smokeAcc += dt;
      if (smokeAcc > .22) { smokeAcc = 0; smoke.push({ x: BX + 10 * k, y: BY - 82 * k, vx: (14 + rnd() * 10) * k, vy: -(14 + rnd() * 10) * k, life: 2.6 + rnd(), age: 0, size: (7 + rnd() * 4) * k }); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, CW, CH);
      ctx.globalCompositeOperation = "source-over";
      for (let i = smoke.length - 1; i >= 0; i--) {
        const p = smoke[i]; p.age += dt;
        if (p.age >= p.life) { smoke.splice(i, 1); continue; }
        const u = p.age / p.life;
        p.x += p.vx * dt; p.y += p.vy * dt;
        ctx.globalAlpha = Math.sin(u * Math.PI) * (light ? .16 : .1);
        const s = p.size * (1 + u * 2.4);
        ctx.fillStyle = light ? "#3a2412" : "#2a1a0e";
        ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, 6.283); ctx.fill();
      }
      ctx.globalCompositeOperation = light ? "source-over" : "lighter";
      // hot base glow
      ctx.globalAlpha = (.3 + .12 * Math.sin(t * 9) + .1 * Math.sin(t * 23 + 1)) * (1 + boost * .3);
      const bs = 20 * k * (1 + boost * .25);
      ctx.drawImage(sprites[2], BX - bs, BY - bs * .9, bs * 2, bs * 2);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]; p.age += dt;
        if (p.age >= p.life) { parts.splice(i, 1); continue; }
        const u = p.age / p.life;
        p.vy *= 1 - .35 * dt;
        p.x += (p.vx + (46 + Math.sin(t * 3.1 + p.ph) * 22) * u * k + Math.sin(t * 9 + p.ph * 3) * 34 * u * k) * dt;
        p.y += p.vy * dt;
        const s = p.size * (1.15 - u * .9) * 2.4;
        ctx.globalAlpha = Math.pow(1 - u, 1.2) * (light ? .4 : .26);
        ctx.drawImage(sprites[Math.min(N - 1, Math.floor(u * (N - 1)))], p.x - s / 2, p.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    }
    requestAnimationFrame(frame);
  })();
  const root = scene.style;  // set on the scene only, so scrolling does not restyle the whole page
  let raf = 0, sy = 0, px = 0, py = 0;
  const apply = () => { raf = 0; root.setProperty("--sy", sy); root.setProperty("--px", px.toFixed(3)); root.setProperty("--py", py.toFixed(3)); };
  const queue = () => { if (!raf) raf = requestAnimationFrame(apply); };
  addEventListener("scroll", () => { sy = scrollY; queue(); }, { passive: true });
  addEventListener("pointermove", (e) => { px = (e.clientX / innerWidth - .5) * 2; py = (e.clientY / innerHeight - .5) * 2; queue(); }, { passive: true });
  // 3D tilt on the hero card and favourites, with a spring release (the CSS transition does the springing)
  const tiltSel = ".pylon,.fav,.save-card";
  const tilt = (e) => {
    const el = e.target.closest && e.target.closest(tiltSel);
    if (!el || e.pointerType === "touch" && e.type === "pointermove" && !el.matches(":active")) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    el.style.setProperty("--ry", (x * 10).toFixed(2) + "deg");
    el.style.setProperty("--rx", (-y * 8).toFixed(2) + "deg");
    el.classList.add("tilting");
  };
  const untilt = (e) => {
    const el = e.target.closest && e.target.closest(tiltSel);
    if (!el) return;
    el.classList.remove("tilting");
    el.style.removeProperty("--ry"); el.style.removeProperty("--rx");
  };
  if (!REDUCE_MOTION) {
    app.addEventListener("pointermove", tilt, { passive: true });
    app.addEventListener("pointerdown", tilt, { passive: true });
    app.addEventListener("pointerout", untilt, { passive: true });
    app.addEventListener("pointerup", untilt, { passive: true });
    app.addEventListener("pointercancel", untilt, { passive: true });
  }
})();
// Sections start paused (.rv) and play once scrolled into view
let rvObs = null;
function observeReveals() {
  if (rvObs) rvObs.disconnect();
  const els = app.querySelectorAll(".rv");
  if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
  rvObs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); rvObs.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
  els.forEach((e) => rvObs.observe(e));
}
/* FLIP: remember where list rows are, run fn (re-render), then animate rows from their old spot */
function flip(fn) {
  const first = new Map();
  app.querySelectorAll(".list .row[data-id]").forEach((el) => first.set(el.dataset.id, el.getBoundingClientRect().top));
  fn();
  if (REDUCE_MOTION) return;
  app.querySelectorAll(".list .row[data-id]").forEach((el, i) => {
    const was = first.get(el.dataset.id);
    el.style.animation = "none";
    if (was == null) { el.animate([{ opacity: 0, transform: "translateY(18px)" }, { opacity: 1, transform: "none" }], { duration: 450, delay: i * 25, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" }); return; }
    const dy = was - el.getBoundingClientRect().top;
    if (Math.abs(dy) < 1) return;
    el.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], { duration: 650, easing: "cubic-bezier(.34,1.4,.5,1)" });
  });
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (reloadOnUpdate) location.reload(); });
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
applyTheme();
load();
