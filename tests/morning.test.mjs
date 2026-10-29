// Run: node tests/morning.test.mjs
// Tests the "morning push report" block of app.js (subscription logic and settings markup) with stubbed browser APIs.
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const src = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const a = src.indexOf("/* ---------- morning push report");
const b = src.indexOf("/* ---------- settings sheet ---------- */");
assert.ok(a > 0 && b > a, "morning block not found in app.js");
const block = src.slice(a, b);

const plain = (x) => JSON.parse(JSON.stringify(x)); // objects made inside the vm context have another prototype
let passed = 0;
async function test(name, fn) { await fn(); passed++; console.log("ok  " + name); }

function makeEnv(opts = {}) {
  const calls = { fetch: [], subscribe: 0, unsubscribe: 0, toasts: [], renders: 0, requestPermission: 0 };
  const stored = {};
  const subObj = { endpoint: "https://fcm.googleapis.com/fcm/send/abc", toJSON() { return { endpoint: this.endpoint, keys: { p256dh: "P".repeat(87), auth: "a".repeat(22) } }; }, options: {}, async unsubscribe() { calls.unsubscribe++; current.sub = null; } };
  const current = { sub: opts.existingSub ? subObj : null };
  const ctx = {
    console, atob: (x) => Buffer.from(x, "base64").toString("binary"), btoa: (x) => Buffer.from(x, "binary").toString("base64"),
    Uint8Array, String, Object, Array, Number, JSON, Promise, URL,
    state: { lang: "ru", fuel: "diesel", morning: opts.morning || null },
    store: { set(k, v) { stored[k] = v; } },
    t: (k) => k + "!",
    isIos: () => !!opts.ios, isStandalone: () => !!opts.standalone,
    buzz() {}, render() { calls.renders++; }, toast(m) { calls.toasts.push(m); },
    navigator: opts.unsupported ? {} : { serviceWorker: { ready: Promise.resolve({ pushManager: { async getSubscription() { return current.sub; }, async subscribe() { calls.subscribe++; current.sub = subObj; return subObj; } } }) } },
    window: opts.unsupported ? {} : { PushManager: function () {}, Notification: {} },
    Notification: opts.unsupported ? undefined : { permission: opts.permission || "default", async requestPermission() { calls.requestPermission++; this.permission = opts.grant === false ? "denied" : "granted"; return this.permission; } },
    fetch: async (url, init) => {
      calls.fetch.push({ url, body: init && init.body ? JSON.parse(init.body) : null });
      if (url.endsWith("/vapid")) return { ok: true, json: async () => ({ key: "BPubKey" }) };
      if (opts.failSync && url.endsWith("/sync")) return { ok: false, status: 500 };
      return { ok: true, json: async () => ({ ok: true }) };
    },
  };
  // the block expects these globals from the rest of app.js
  vm.createContext(ctx);
  vm.runInContext(`var I18N = { ru: {}, en: {}, lv: {} };`, ctx);
  // "in" checks on the window object are written against the global scope in app.js, so mirror them
  if (!opts.unsupported) { ctx.PushManager = ctx.window.PushManager; }
  vm.runInContext(block + "\nthis.__api = { PUSH, setMorning, morningChange, morningSync, renderMorning, I18N };", ctx);
  ctx.__api.PUSH.api = opts.noApi ? null : "https://w.test";
  return { ctx, calls, stored, current, api: ctx.__api };
}

await test("i18n: every morning string exists in ru, en and lv", () => {
  const { api } = makeEnv();
  const keys = Object.keys(api.I18N.ru).filter((k) => k.startsWith("morning"));
  assert.ok(keys.length >= 11);
  for (const lang of ["en", "lv"]) assert.deepEqual(Object.keys(api.I18N[lang]).filter((k) => k.startsWith("morning")).sort(), keys.sort());
});

await test("settings markup: hidden without a configured Worker, switch only when off, hour and fuel buttons when on", () => {
  assert.equal(makeEnv({ noApi: true }).api.renderMorning(), "");
  const off = makeEnv().api.renderMorning();
  assert.match(off, /data-act="morning"/);
  assert.ok(!off.includes("morninghour"));
  const on = makeEnv({ morning: { hour: 8, fuels: ["95", "diesel"] } }).api.renderMorning();
  assert.match(on, /data-act="morning" checked/);
  assert.equal((on.match(/data-act="morninghour"/g) || []).length, 3);
  assert.match(on, /data-act="morninghour" data-v="8" aria-pressed="true"/);
  assert.match(on, /data-act="morninghour" data-v="7" aria-pressed="false"/);
  assert.equal((on.match(/data-act="morningfuel"/g) || []).length, 4);
  assert.match(on, /data-v="diesel" aria-pressed="true"/);
  assert.match(on, /data-v="98" aria-pressed="false"/);
});

await test("turning on: asks permission, subscribes, sends app=fuel with hour and fuels to the Worker", async () => {
  const e = makeEnv();
  await e.api.setMorning(true);
  assert.equal(e.calls.requestPermission, 1);
  assert.equal(e.calls.subscribe, 1);
  assert.deepEqual(plain(e.ctx.state.morning), { hour: 8, fuels: ["diesel"] }); // starts with the fuel the person is looking at
  assert.deepEqual(plain(e.stored.morning), { hour: 8, fuels: ["diesel"] });
  const sync = e.calls.fetch.find((c) => c.url.endsWith("/sync"));
  assert.equal(sync.body.app, "fuel");
  assert.equal(sync.body.lang, "ru");
  assert.deepEqual(sync.body.morning, { hour: 8, fuels: ["diesel"] });
  assert.ok(sync.body.sub.endpoint && sync.body.sub.keys.auth);
  assert.equal(e.calls.toasts.at(-1), "morningOnToast!");
});

await test("turning on: notifications denied -> stays off, says why, nothing sent to the Worker", async () => {
  const e = makeEnv({ grant: false });
  await e.api.setMorning(true);
  assert.equal(e.ctx.state.morning, null);
  assert.equal(e.calls.fetch.length, 0);
  assert.equal(e.calls.toasts.at(-1), "morningDenied!");
});

await test("turning on: Worker error -> switches back off and tells the person", async () => {
  const e = makeEnv({ failSync: true });
  await e.api.setMorning(true);
  assert.equal(e.ctx.state.morning, null);
  assert.equal(e.stored.morning, null);
  assert.equal(e.calls.toasts.at(-1), "morningFail!");
});

await test("turning on: iPhone in a Safari tab and unsupported browsers get a hint instead of a broken switch", async () => {
  const ios = makeEnv({ ios: true });
  await ios.api.setMorning(true);
  assert.equal(ios.ctx.state.morning, null);
  assert.equal(ios.calls.toasts.at(-1), "morningIos!");
  const old = makeEnv({ unsupported: true });
  await old.api.setMorning(true);
  assert.equal(old.calls.toasts.at(-1), "morningNoSupport!");
  assert.equal(await old.api.morningSync(), "off");
});

await test("turning off: unsubscribes on the Worker and in the browser", async () => {
  const e = makeEnv({ morning: { hour: 8, fuels: ["95"] }, existingSub: true, permission: "granted" });
  await e.api.setMorning(false);
  assert.equal(e.ctx.state.morning, null);
  assert.ok(e.calls.fetch.some((c) => c.url.endsWith("/unsubscribe") && c.body.endpoint));
  assert.equal(e.calls.unsubscribe, 1);
  assert.equal(e.calls.toasts.at(-1), "morningOffToast!");
});

await test("changing hour or fuels re-syncs; the last fuel cannot be switched off", async () => {
  const e = makeEnv({ morning: { hour: 8, fuels: ["95"] }, permission: "granted" });
  e.api.morningChange({ hour: 7 });
  await new Promise((r) => setTimeout(r, 10));
  const sync = e.calls.fetch.filter((c) => c.url.endsWith("/sync")).at(-1);
  assert.deepEqual(sync.body.morning, { hour: 7, fuels: ["95"] });
  e.api.morningChange({ fuels: [] });
  assert.deepEqual(plain(e.ctx.state.morning.fuels), ["95"]);
});

console.log("\n" + passed + " tests passed");
