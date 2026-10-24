# Degvielas Radars

Самое дешёвое топливо в Латвии: цены по станциям, сетям и районам Риги, калькулятор бака, динамика цен и нефть.
Приложение устанавливается на экран телефона как PWA.

- `index.html`, `app.js`, `style.css`, `sw.js`: само приложение, без сборки и зависимостей.
- `scripts/scrape.py`: собирает цены с letadegviela.lv, нефть с Yahoo Finance, пишет `data/*.json`.
- `data/report.json`: утренний отчёт (самое дешёвое сегодня и разница со вчера).
- `.github/workflows/update.yml`: сбор данных по расписанию и публикация на GitHub Pages.

Тесты парсера: `python -m unittest discover -s tests`.
