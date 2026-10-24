#!/usr/bin/env python3
"""Degvielas Radars: collects fuel prices for Latvia and writes data/*.json.

Source: letadegviela.lv (server-rendered HTML). One polite request per page,
roughly 45 pages per run. Output files:

  data/prices.json   current stations + prices (what the app reads)
  data/history.json  one record per day per scope (min / avg per fuel)
  data/report.json   the morning report (cheapest today vs yesterday)
  data/oil.json      Brent / WTI / EURUSD from Yahoo Finance (best effort)

Only the standard library plus beautifulsoup4 is used.
"""
from __future__ import annotations

import json
import re
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

from bs4 import BeautifulSoup

BASE = "https://letadegviela.lv"
UA = (
    "DegvielasRadars/1.0 (personal price tracker; "
    "https://github.com/digitalcreatorhub/degvievas-radars)"
)
RIGA_TZ = ZoneInfo("Europe/Riga")
ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"

FUEL_BY_LABEL = {
    "95": "95",
    "98": "98",
    "D": "diesel",
    "D+": "dplus",
    "LPG": "lpg",
    "CNG": "cng",
}
FUEL_ORDER = ["95", "98", "diesel", "dplus", "lpg", "cng"]
# Kinds that tell what is actually posted at the pump.
EXACT_KINDS = {"station", "network", "user"}
USER_MAX_AGE_H = 72  # driver-entered prices older than this are not "exact"
HISTORY_DAYS = 180
SLEEP_BETWEEN = 1.2
CRAWL_BUDGET_S = 420  # stop crawling after this; unfinished cities keep their previous data


# ---------------------------------------------------------------- fetching

def fetch(url: str, retries: int = 3, timeout: int = 30) -> str:
    last: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": UA,
                    "Accept": "text/html,application/xhtml+xml",
                    "Accept-Language": "lv,en;q=0.8,ru;q=0.6",
                },
            )
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                body = resp.read().decode("utf-8", errors="replace")
            if "Just a moment" in body[:2000] or "cf-challenge" in body[:4000]:
                raise RuntimeError("Cloudflare challenge page returned")
            return body
        except (urllib.error.URLError, TimeoutError, RuntimeError) as exc:
            last = exc
            if attempt < retries:
                time.sleep(3 * attempt)
    raise RuntimeError(f"fetch failed for {url}: {last}")


# ----------------------------------------------------------------- parsing

PRICE_RE = re.compile(r"(\d+)[.,](\d{2,3})")
CHANGED_RE = re.compile(r"cena mainīta\s+(\d{1,2})\.(\d{1,2})\.\s+(\d{1,2}):(\d{2})")
AGO_RE = re.compile(r"(?:pirms|·)\s*(\d+)\s*(min|h)\b")
LL_RE = re.compile(r"ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)")
COLOR_RE = re.compile(r"background:\s*(#[0-9a-fA-F]{3,8})")


def parse_price(text: str) -> float | None:
    m = PRICE_RE.search(text.replace("\xa0", " "))
    if not m:
        return None
    value = float(f"{m.group(1)}.{m.group(2)}")
    return round(value, 3) if 0.3 <= value <= 4.5 else None


def parse_changed(title: str, now: datetime) -> str | None:
    """'cena mainīta 23.10. 07:20' -> ISO local time, year inferred."""
    m = CHANGED_RE.search(title or "")
    if not m:
        return None
    day, month, hour, minute = (int(x) for x in m.groups())
    try:
        dt = datetime(now.year, month, day, hour, minute, tzinfo=RIGA_TZ)
    except ValueError:
        return None
    if dt > now + timedelta(days=1):
        dt = dt.replace(year=now.year - 1)
    return dt.strftime("%Y-%m-%dT%H:%M")


def classify(pc_text: str, title: str, classes: list[str]) -> str:
    """station = this station's own price; network = one price for every
    station of the chain; min = the chain's lowest price (this station may be
    higher); user = entered by a driver."""
    text = (pc_text or "").lower()
    title_l = (title or "").lower()
    if "pc-user" in classes or "lietotāju" in text:
        return "user"
    if "tīkls nosaka vienu cenu" in title_l or text.startswith(("tīkla cena", "tīkls")):
        return "network"
    if "zemākā" in text or "var būt augstāka" in title_l:
        return "min"
    if "šīs dus" in text or "šo cenu šai dus" in title_l:
        return "station"
    return "min"  # unknown wording: treat as an estimate, never as exact


def price_cell(price_el, pc_el, shared_pc, now: datetime) -> dict | None:
    if price_el is None:
        return None
    price = parse_price(price_el.get_text())
    if price is None:
        return None
    pc = pc_el or shared_pc
    pc_text = pc.get_text(" ", strip=True) if pc else ""
    title = (pc.get("title") if pc else "") or price_el.get("title") or ""
    classes = pc.get("class", []) if pc else []
    entry = {"p": price, "k": classify(pc_text, title, classes)}
    changed = parse_changed(title, now)
    if changed:
        entry["ch"] = changed
    m = AGO_RE.search(pc_text)
    if m:
        n, unit = int(m.group(1)), m.group(2)
        entry["ago"] = n if unit == "min" else n * 60
    return entry


def parse_page(html: str, now: datetime | None = None) -> dict:
    """Parse one letadegviela.lv listing page."""
    now = now or datetime.now(RIGA_TZ)
    soup = BeautifulSoup(html, "html.parser")
    chains: dict[str, dict] = {}
    stations: list[dict] = []

    for card in soup.select("div.bc"):
        slug = (card.get("id") or "").removeprefix("b-")
        name_el = card.select_one("h3.bn")
        if not slug or name_el is None:
            continue
        dot = card.select_one(".bd")
        color_m = COLOR_RE.search(dot.get("style", "")) if dot else None
        chain_prices: dict[str, dict] = {}
        shared_pc = card.select_one(".npcap .pc")
        for tr in card.select("table.np tr[data-fuel]"):
            label_el = tr.select_one("td.lb2")
            fuel = FUEL_BY_LABEL.get(label_el.get_text(strip=True)) if label_el else None
            if not fuel:
                continue
            cell = price_cell(tr.select_one("td.npv"), tr.select_one(".pc"), shared_pc, now)
            if cell:
                chain_prices[fuel] = cell
        chains[slug] = {
            "name": name_el.get_text(strip=True),
            "color": color_m.group(1) if color_m else "#888888",
            "prices": chain_prices,
        }

        for sr in card.select("div.sr"):
            addr_el = sr.select_one(".sa")
            wb = sr.select_one("a.wb")
            if addr_el is None or wb is None:
                continue
            ll = LL_RE.search(wb.get("href", ""))
            if not ll:
                continue
            lat, lng = float(ll.group(1)), float(ll.group(2))
            sells = [
                FUEL_BY_LABEL[b.get_text(strip=True)]
                for b in sr.select(".fb .fbg")
                if b.get_text(strip=True) in FUEL_BY_LABEL
            ]
            own: dict[str, dict] = {}
            for spl in sr.select(".spl"):
                label_el = spl.select_one(".lb2")
                fuel = FUEL_BY_LABEL.get(label_el.get_text(strip=True)) if label_el else None
                if not fuel:
                    continue
                cell = price_cell(spl.select_one(".spv"), spl.select_one(".pc"), None, now)
                if cell:
                    own[fuel] = cell
            fuels: dict[str, dict] = {}
            for fuel in sells:
                if fuel in own:
                    fuels[fuel] = own[fuel]
                elif fuel in chain_prices:
                    fuels[fuel] = dict(chain_prices[fuel])
            for fuel, cell in own.items():  # priced but not listed as sold
                fuels.setdefault(fuel, cell)
            stations.append(
                {
                    "id": f"{slug}:{lat:.5f},{lng:.5f}",
                    "chain": slug,
                    "address": addr_el.get_text(strip=True),
                    "lat": lat,
                    "lng": lng,
                    "sells": sells,
                    "fuels": fuels,
                }
            )

    updated = None
    m = re.search(r"atjaunots\s+(\d{1,2}:\d{2})", soup.get_text(" "))
    if m:
        updated = m.group(1)

    def links(selector_part: str, exclude: str | None = None):
        out = []
        for a in soup.select("a[href]"):
            href = a["href"]
            if selector_part in href and (exclude is None or exclude not in href):
                out.append(a)
        return out

    cities = []
    for a in links("city=", exclude="area="):
        slug = re.search(r"city=([a-z0-9-]+)", a["href"])
        if slug and slug.group(1) not in {c["slug"] for c in cities}:
            cities.append({"slug": slug.group(1), "name": _clean_label(a)})
    areas = []
    for a in links("area="):
        m_area = re.search(r"area=([a-z0-9-]+)", a["href"])
        m_city = re.search(r"city=([a-z0-9-]+)", a["href"])
        if m_area and m_area.group(1) not in {x["slug"] for x in areas}:
            areas.append(
                {
                    "slug": m_area.group(1),
                    "city": m_city.group(1) if m_city else "riga",
                    "name": _clean_label(a),
                }
            )
    return {
        "chains": chains,
        "stations": stations,
        "source_updated": updated,
        "cities": cities,
        "areas": areas,
    }


def _clean_label(a) -> str:
    for span in a.find_all("span"):
        span.extract()
    return re.sub(r"\s+", " ", a.get_text(" ", strip=True)).strip()


# ---------------------------------------------------------------- crawling

def crawl(now: datetime, previous: dict | None) -> dict:
    deadline = time.monotonic() + CRAWL_BUDGET_S
    home = parse_page(fetch(BASE + "/"), now)
    if len(home["stations"]) < 50:
        raise RuntimeError(f"home page parsed only {len(home['stations'])} stations")
    time.sleep(SLEEP_BETWEEN)

    cities = [c for c in home["cities"] if c["slug"] != "riga"]
    city_names = {c["slug"]: c["name"] for c in home["cities"]}
    city_names.setdefault("riga", "Rīga")

    stations: dict[str, dict] = {}
    chains: dict[str, dict] = {}
    failed: list[str] = []

    def absorb(page: dict, city: str):
        for slug, chain in page["chains"].items():
            chains.setdefault(slug, {"name": chain["name"], "color": chain["color"]})
        for st in page["stations"]:
            existing = stations.get(st["id"])
            if existing is None:
                st["city"] = city
                st["areas"] = []
                stations[st["id"]] = st

    absorb(home, "riga")
    for city in cities:
        if time.monotonic() > deadline:
            print(f"warn: crawl budget used up, skipping {city['slug']}", file=sys.stderr)
            failed.append(city["slug"])
            continue
        try:
            page = parse_page(fetch(f"{BASE}/?city={city['slug']}", retries=2, timeout=20), now)
            absorb(page, city["slug"])
        except RuntimeError as exc:
            print(f"warn: {city['slug']}: {exc}", file=sys.stderr)
            failed.append(city["slug"])
        time.sleep(SLEEP_BETWEEN)

    areas = []
    for area in home["areas"]:
        if time.monotonic() > deadline:
            print("warn: crawl budget used up, skipping remaining areas", file=sys.stderr)
            break
        try:
            page = parse_page(fetch(f"{BASE}/?area={area['slug']}&city={area['city']}", retries=2, timeout=20), now)
        except RuntimeError as exc:
            print(f"warn: area {area['slug']}: {exc}", file=sys.stderr)
            time.sleep(SLEEP_BETWEEN)
            continue
        count = 0
        for st in page["stations"]:
            target = stations.get(st["id"])
            if target is not None and area["slug"] not in target["areas"]:
                target["areas"].append(area["slug"])
                count += 1
        areas.append({**area, "count": count})
        time.sleep(SLEEP_BETWEEN)

    # Keep the previous snapshot for cities that failed this time.
    if previous and failed:
        for st in previous.get("stations", []):
            if st.get("city") in failed and st["id"] not in stations:
                st["stale"] = True
                stations[st["id"]] = st

    counts: dict[str, int] = {}
    for st in stations.values():
        counts[st["city"]] = counts.get(st["city"], 0) + 1
    city_list = [
        {"slug": slug, "name": city_names.get(slug, slug.title()), "count": n}
        for slug, n in sorted(counts.items(), key=lambda kv: (kv[0] != "riga", -kv[1]))
    ]
    return {
        "schema": 1,
        "generated_at": now.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": {"name": "letadegviela.lv", "url": BASE},
        "source_updated": home["source_updated"],
        "cities": city_list,
        "areas": areas,
        "chains": chains,
        "stations": sorted(stations.values(), key=lambda s: (s["city"], s["chain"], s["address"])),
        "failed_cities": failed,
    }


# ------------------------------------------------------------ statistics

def is_exact(cell: dict, now: datetime) -> bool:
    kind = cell.get("k")
    if kind not in EXACT_KINDS:
        return False
    if kind == "user":
        ch = cell.get("ch")
        if not ch:
            return False
        age = now - datetime.strptime(ch, "%Y-%m-%dT%H:%M").replace(tzinfo=RIGA_TZ)
        return age <= timedelta(hours=USER_MAX_AGE_H)
    return True


def scope_stats(stations: list[dict], now: datetime) -> dict:
    out: dict[str, dict] = {}
    for fuel in FUEL_ORDER:
        exact = []
        for st in stations:
            cell = st["fuels"].get(fuel)
            if cell and is_exact(cell, now):
                exact.append((cell["p"], st))
        if not exact:
            continue
        exact.sort(key=lambda t: t[0])
        prices = [p for p, _ in exact]
        best_price, best = exact[0]
        by_chain: dict[str, float] = {}
        for p, st in exact:
            by_chain[st["chain"]] = min(p, by_chain.get(st["chain"], p))
        out[fuel] = {
            "min": best_price,
            "avg": round(sum(prices) / len(prices), 3),
            "n": len(prices),
            "station": best["id"],
            "chain": best["chain"],
            "chains": dict(sorted(by_chain.items(), key=lambda kv: kv[1])),
        }
    return out


def update_history(path: Path, prices: dict, now: datetime) -> dict:
    history = {"schema": 1, "days": {}}
    if path.exists():
        try:
            history = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            pass
    today = now.strftime("%Y-%m-%d")
    scopes = {"all": scope_stats(prices["stations"], now)}
    for city in prices["cities"]:
        sub = [s for s in prices["stations"] if s["city"] == city["slug"]]
        scopes[city["slug"]] = scope_stats(sub, now)
    # Compact: drop the verbose per-chain map for non-Riga scopes.
    for slug, stats in scopes.items():
        if slug not in ("all", "riga"):
            for entry in stats.values():
                entry.pop("chains", None)
    history["days"][today] = scopes
    keep = sorted(history["days"])[-HISTORY_DAYS:]
    history["days"] = {d: history["days"][d] for d in keep}
    return history


# ---------------------------------------------------------------- report

FUEL_NAME_RU = {
    "95": "95", "98": "98", "diesel": "дизель",
    "dplus": "дизель+", "lpg": "газ (LPG)", "cng": "CNG",
}


def build_report(prices: dict, history: dict, now: datetime, scope: str = "riga") -> dict:
    today = now.strftime("%Y-%m-%d")
    days = sorted(d for d in history["days"] if d < today)
    prev = history["days"][days[-1]].get(scope, {}) if days else {}
    cur = history["days"][today].get(scope, {})
    by_id = {s["id"]: s for s in prices["stations"]}
    fuels: dict[str, dict] = {}
    for fuel in ("95", "diesel", "98", "lpg"):
        entry = cur.get(fuel)
        if not entry:
            continue
        st = by_id[entry["station"]]
        prev_min = prev.get(fuel, {}).get("min")
        fuels[fuel] = {
            "price": entry["min"],
            "avg": entry["avg"],
            "chain": prices["chains"][st["chain"]]["name"],
            "address": st["address"],
            "lat": st["lat"],
            "lng": st["lng"],
            "prev": prev_min,
            "delta": round(entry["min"] - prev_min, 3) if prev_min else None,
            "ranking": [
                {"chain": prices["chains"][c]["name"], "price": p}
                for c, p in list(entry.get("chains", {}).items())[:4]
            ],
        }
    return {
        "schema": 1,
        "date": today,
        "scope": scope,
        "generated_at": prices["generated_at"],
        "fuels": fuels,
        "text_ru": report_text(fuels),
    }


def report_text(fuels: dict) -> str:
    lines = []
    for fuel in ("95", "diesel"):
        f = fuels.get(fuel)
        if not f:
            continue
        delta = ""
        if f["delta"] is not None:
            if abs(f["delta"]) < 0.0005:
                delta = " (без изменений)"
            else:
                arrow = "↓" if f["delta"] < 0 else "↑"
                delta = f" ({arrow}{abs(f['delta']) * 100:.1f} цента)"
        lines.append(
            f"{FUEL_NAME_RU[fuel]}: {f['price']:.3f} € — {f['chain']}, {f['address']}{delta}"
        )
    return "Рига, самое дешёвое сегодня\n" + "\n".join(lines) if lines else ""


# -------------------------------------------------------------------- oil

def yahoo_chart(symbol: str) -> dict | None:
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?range=5d&interval=1h"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        result = data["chart"]["result"][0]
        meta = result["meta"]
        closes = [c for c in result["indicators"]["quote"][0]["close"] if c is not None]
        price = meta.get("regularMarketPrice") or closes[-1]
        prev = meta.get("chartPreviousClose") or meta.get("previousClose") or closes[0]
        return {
            "price": round(price, 4),
            "prev": round(prev, 4),
            "series": [round(c, 3) for c in closes[-48:]],
            "ts": datetime.fromtimestamp(
                meta.get("regularMarketTime", time.time()), RIGA_TZ
            ).strftime("%Y-%m-%dT%H:%M"),
        }
    except Exception as exc:  # noqa: BLE001 - best effort, never fail the run
        print(f"warn: yahoo {symbol}: {exc}", file=sys.stderr)
        return None


def fetch_oil() -> dict | None:
    brent, wti, fx = yahoo_chart("BZ=F"), yahoo_chart("CL=F"), yahoo_chart("EURUSD=X")
    if not (brent and wti):
        return None
    return {
        "schema": 1,
        "eurusd": fx["price"] if fx else None,
        "brent": brent,
        "wti": wti,
    }


# ------------------------------------------------------------------- main

def write_json(path: Path, obj: dict):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(obj, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    tmp.replace(path)


def main() -> int:
    now = datetime.now(RIGA_TZ)
    prices_path = DATA / "prices.json"
    previous = None
    if prices_path.exists():
        try:
            previous = json.loads(prices_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            previous = None

    prices = crawl(now, previous)
    write_json(prices_path, prices)
    history = update_history(DATA / "history.json", prices, now)
    write_json(DATA / "history.json", history)
    write_json(DATA / "report.json", build_report(prices, history, now))

    oil = fetch_oil()
    if oil:
        write_json(DATA / "oil.json", oil)

    print(
        f"ok: {len(prices['stations'])} stations, {len(prices['cities'])} cities, "
        f"{len(prices['areas'])} areas, failed={prices['failed_cities']}, oil={'yes' if oil else 'no'}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
