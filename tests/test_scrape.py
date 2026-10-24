import sys
import unittest
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

import scrape  # noqa: E402

NOW = datetime(2026, 10, 24, 9, 0, tzinfo=scrape.RIGA_TZ)
HTML = (ROOT / "tests" / "fixtures" / "riga_sample.html").read_text(encoding="utf-8")


class ParseTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.page = scrape.parse_page(HTML, NOW)
        cls.by_addr = {s["address"]: s for s in cls.page["stations"]}

    def test_counts_and_meta(self):
        self.assertEqual(len(self.page["stations"]), 8)
        self.assertEqual(set(self.page["chains"]), {"viada", "neste", "straujupite", "lpg"})
        self.assertEqual(self.page["source_updated"], "08:41")
        self.assertEqual(self.page["chains"]["viada"]["color"], "#E31E24")

    def test_navigation_discovery(self):
        self.assertEqual([c["slug"] for c in self.page["cities"]], ["jurmala", "jelgava"])
        self.assertEqual(self.page["cities"][0]["name"], "Jūrmala")
        self.assertEqual([a["slug"] for a in self.page["areas"]], ["centrs-vecriga", "imanta-zolitude"])
        self.assertEqual(self.page["areas"][0]["name"], "Centrs / Vecrīga")
        self.assertEqual(self.page["areas"][0]["city"], "riga")

    def test_station_own_price(self):
        st = self.by_addr["Andreja Saharova iela 10, Rīga"]
        self.assertEqual(st["fuels"]["95"]["p"], 1.847)
        self.assertEqual(st["fuels"]["95"]["k"], "station")
        self.assertEqual(st["fuels"]["95"]["ch"], "2026-10-23T07:20")
        self.assertEqual(st["fuels"]["95"]["ago"], 60)
        self.assertAlmostEqual(st["lat"], 56.9349)

    def test_chain_minimum_is_an_estimate(self):
        st = self.by_addr["Apuzes iela 47, Rīga"]
        self.assertEqual(st["fuels"]["95"]["p"], 1.847)
        self.assertEqual(st["fuels"]["95"]["k"], "min")
        st = self.by_addr["Jenotu iela 19, Rīga"]
        self.assertEqual(st["fuels"]["95"]["k"], "min")
        self.assertEqual(st["fuels"]["95"]["ago"], 58)

    def test_station_override_beats_chain_price(self):
        st = self.by_addr["Dārzciema iela 62, Rīga"]
        self.assertEqual(st["fuels"]["diesel"]["p"], 2.054)
        self.assertEqual(st["fuels"]["diesel"]["k"], "station")
        self.assertEqual(st["fuels"]["95"]["k"], "min")

    def test_network_price_is_exact_for_every_station(self):
        st = self.by_addr["Katoļu iela 4, Rīga"]
        self.assertEqual(st["fuels"]["95"], {"p": 1.903, "k": "network", "ch": "2026-10-23T10:10", "ago": 1380})
        self.assertEqual(st["fuels"]["diesel"]["p"], 2.006)

    def test_user_price_and_fuel_without_price(self):
        st = self.by_addr["Brīvības gatve 386, Rīga"]
        self.assertEqual(st["fuels"]["lpg"]["k"], "user")
        self.assertEqual(st["fuels"]["lpg"]["p"], 0.941)
        self.assertNotIn("98", st["fuels"])

    def test_brand_wide_driver_price_is_only_an_estimate(self):
        no_price = self.by_addr["Ganību dambis 29a"]["fuels"]["lpg"]
        self.assertEqual((no_price["p"], no_price["k"]), (0.93, "min"))
        own = self.by_addr["Skanstes iela 48"]["fuels"]["lpg"]
        self.assertEqual((own["p"], own["k"]), (0.905, "user"))

    def test_lpg_driver_price_stays_exact_for_weeks(self):
        own = self.by_addr["Skanstes iela 48"]["fuels"]["lpg"]
        self.assertTrue(scrape.is_exact(own, NOW, "lpg"))
        old = {**own, "ch": "2026-09-20T09:00"}
        self.assertFalse(scrape.is_exact(old, NOW, "lpg"))
        self.assertFalse(scrape.is_exact({**own, "ch": "2026-10-10T09:00"}, NOW, "95"))

    def test_year_rollover(self):
        jan = datetime(2027, 1, 2, 9, 0, tzinfo=scrape.RIGA_TZ)
        self.assertEqual(scrape.parse_changed("cena mainīta 31.12. 23:10", jan), "2026-12-31T23:10")

    def test_price_sanity(self):
        self.assertEqual(scrape.parse_price("1.847\xa0€"), 1.847)
        self.assertIsNone(scrape.parse_price("—"))
        self.assertIsNone(scrape.parse_price("9.999 €"))


class StatsTests(unittest.TestCase):
    def test_exact_vs_estimate(self):
        page = scrape.parse_page(HTML, NOW)
        stats = scrape.scope_stats(page["stations"], NOW)
        # Exact 95: Viada Saharova 1.847 (station) and Neste network 1.903.
        self.assertEqual(stats["95"]["min"], 1.847)
        self.assertEqual(stats["95"]["chain"], "viada")
        self.assertEqual(stats["95"]["n"], 3)  # Saharova + 2 Neste stations
        # LPG: the 07.10. driver price at Neste is 17 days old (still exact for LPG),
        # and the Skanstes iela 48 price is the cheapest.
        self.assertEqual(stats["lpg"]["min"], 0.905)
        self.assertEqual(stats["lpg"]["n"], 2)

    def test_report_text(self):
        page = scrape.parse_page(HTML, NOW)
        page.update({"generated_at": "2026-10-24T06:00:00Z", "cities": [{"slug": "riga"}]})
        for st in page["stations"]:
            st["city"] = "riga"
        for slug, chain in page["chains"].items():
            chain.pop("prices", None)
        history = scrape.update_history(ROOT / "tests" / "_none.json", page, NOW)
        report = scrape.build_report(page, history, NOW)
        self.assertEqual(report["fuels"]["95"]["price"], 1.847)
        self.assertIn("1.847", report["text_ru"])


if __name__ == "__main__":
    unittest.main()
