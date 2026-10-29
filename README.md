# Degvielas Radars

Самое дешёвое топливо в Латвии: цены по станциям, сетям и районам Риги, калькулятор бака, динамика цен и нефть.
Приложение устанавливается на экран телефона как PWA.

- `index.html`, `app.js`, `style.css`, `sw.js`: само приложение, без сборки и зависимостей.
- `scripts/scrape.py`: собирает цены с letadegviela.lv, нефть с Yahoo Finance, пишет `data/*.json`.
- `data/report.json`: утренний отчёт (самое дешёвое сегодня и разница со вчера).
- `.github/workflows/update.yml`: сбор данных по расписанию и публикация на GitHub Pages.

Утренний отчёт пушем: в настройках приложения человек включает отчёт, выбирает час (07, 08 или 09 по Риге) и виды топлива. Подписка хранится в общем Worker `uzlades-push` (приложение зарядок, поле `app = fuel`, адрес в `push-config.json`), а рассылает её GitHub Action `send-fuel-morning` из репозитория Uzlades-radars: он берёт цены из `data/report.json` этого сайта. Вчерашние цены утром не отправляются.

Тесты парсера: `python -m unittest discover -s tests`. Тесты утреннего отчёта в приложении: `node tests/morning.test.mjs`.
