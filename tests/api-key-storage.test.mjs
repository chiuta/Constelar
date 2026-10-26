// Constelar — cheia API nu se mai scrie în clar în localStorage (sessionStorage + opțiune explicită „Ține minte”).
// Rulare: node api-key-storage.test.mjs [calea/spre/index.html]
import {createRequire} from "module"; import path from "path"; import {fileURLToPath} from "url";
const require = createRequire(process.env.PW_ROOT || import.meta.url); const {chromium} = require("playwright");
const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILE = "file://" + path.resolve(process.argv[2] || path.join(HERE, "..", "index.html"));
let fails = 0, passes = 0; const check = (n, c, x) => { c ? (passes++, console.log("  ok  " + n)) : (fails++, console.log("FAIL  " + n + (x !== undefined ? "  -> " + JSON.stringify(x) : ""))); };
const b = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--no-sandbox"]});
const CAN = "sk-TESTCANARY-123", CAN2 = "sk-LEGACY-456";
const lsHas = (p, c) => p.evaluate(c => Object.entries(localStorage).filter(([k, v]) => v.includes(c)).map(([k]) => k), c);
const ssHas = (p, c) => p.evaluate(c => Object.entries(sessionStorage).filter(([k, v]) => v.includes(c)).map(([k]) => k), c);
async function open(ctx, lang) { const p = await ctx.newPage(); p.__e = []; p.on("pageerror", e => p.__e.push(String(e))); await p.goto(FILE); await p.waitForTimeout(900); return p; }
async function save(p, key, remember) {
  if (!(await p.isVisible("#fApiKey"))) await p.click("#btnSettings");
  await p.selectOption("#fProvider", "anthropic");
  await p.fill("#fApiKey", key);
  await p.evaluate(r => { document.getElementById("fRememberKey") && (document.getElementById("fRememberKey").checked = r); }, !!remember);
  await p.click('#formSettings button[type=submit]'); await p.waitForTimeout(300);
}
{ // 1. salvare implicită
  const ctx = await b.newContext({serviceWorkers: "block"}); await ctx.route(/^https?:/, r => r.abort());
  const p = await open(ctx); await save(p, CAN, false);
  check("1. cheia NU e în localStorage", (await lsHas(p, CAN)).length === 0, await lsHas(p, CAN));
  check("1. cheia e în sessionStorage", (await ssHas(p, CAN)).length === 1);
  await p.reload(); await p.waitForTimeout(800); await p.click("#btnSettings");
  check("1. după reload cheia revine în câmp (aceeași filă)", await p.inputValue("#fApiKey") === CAN);
  check("1. bifa „ține minte” e debifată", await p.evaluate(() => { const e = document.getElementById("fRememberKey"); return !!e && !e.checked; }));
  await p.keyboard.press("Escape");
  // export fără cheie
  await p.evaluate(() => { document.querySelectorAll(".modal-backdrop,[role=dialog]").forEach(()=>{}); });
  const [dl] = await Promise.all([p.waitForEvent("download"), p.evaluate(() => document.getElementById("btnExport").click())]);
  const txt = require("fs").readFileSync(await dl.path(), "utf8");
  check("1. exportul nu conține cheia", !txt.includes(CAN));
  // filă nouă (altă sesiune) → fără cheie
  const p2 = await ctx.newPage(); await p2.goto(FILE); await p2.waitForTimeout(800); await p2.click("#btnSettings");
  check("1. altă filă (alt sessionStorage): cheia nu există", await p2.inputValue("#fApiKey") === "");
  // 2. „Ține minte”
  await save(p2, CAN, true);
  check("2. cu «Ține minte»: cheia e în localStorage doar în cheia separată", JSON.stringify(await lsHas(p2, CAN)) === '["constelar_apikey_persist"]', await lsHas(p2, CAN));
  check("2. constelar_state_v1 rămâne fără cheie", !(await p2.evaluate(() => localStorage.getItem("constelar_state_v1"))).includes(CAN));
  const p3 = await ctx.newPage(); await p3.goto(FILE); await p3.waitForTimeout(800); await p3.click("#btnSettings");
  check("2. filă nouă: cheia memorată revine + bifa activă", await p3.inputValue("#fApiKey") === CAN && await p3.evaluate(() => document.getElementById("fRememberKey").checked));
  await save(p3, CAN, false);
  check("2. debifat: cheia dispare din localStorage", (await lsHas(p3, CAN)).length === 0);
  check("0 erori JS", [p, p2, p3].every(x => !(x.__e && x.__e.length)), [p.__e]);
  await ctx.close();
}
{ // 3. migrare din starea veche
  const ctx = await b.newContext({serviceWorkers: "block"}); await ctx.route(/^https?:/, r => r.abort());
  await ctx.addInitScript(c => { if (!localStorage.getItem("constelar_state_v1")) localStorage.setItem("constelar_state_v1", JSON.stringify({companions: [], activeId: null, settings: {provider: "anthropic", lang: "en", baseUrl: "https://api.anthropic.com", model: "claude-sonnet-5-5", apiKey: c}})); }, CAN2);
  const p = await open(ctx);
  check("3. migrare: cheia veche a fost ștearsă din localStorage", (await lsHas(p, CAN2)).length === 0, await lsHas(p, CAN2));
  check("3. migrare: cheia veche e acum în sessionStorage", (await ssHas(p, CAN2)).length === 1);
  await p.click("#btnSettings"); check("3. migrare: câmpul o arată", await p.inputValue("#fApiKey") === CAN2);
  await ctx.close();
}
{ // 4. 8 limbi
  const ctx = await b.newContext({serviceWorkers: "block"}); await ctx.route(/^https?:/, r => r.abort());
  const seen = new Set(); let errs = 0;
  for (const l of ["en", "ro", "fr", "it", "es", "pt", "de", "hu"]) {
    const c2 = await b.newContext({serviceWorkers: "block"}); await c2.route(/^https?:/, r => r.abort());
    await c2.addInitScript(l => localStorage.setItem("constelar_state_v1", JSON.stringify({companions: [], activeId: null, settings: {provider: "anthropic", lang: l}})), l);
    const p = await open(c2); errs += p.__e.length; await p.click("#btnSettings");
    const [a, w] = await p.evaluate(() => [document.querySelector('[data-i18n="rememberKey"]').textContent, document.querySelector('[data-i18n="rememberKeyWarn"]').textContent]);
    seen.add(a); check("4. " + l + ": etichetă + avertisment traduse", a.length > 8 && w.length > 100 && (l === "en" || !/^Remember on this device$/.test(a)), [a]);
    await c2.close();
  }
  check("4. 8 etichete distincte", seen.size === 8); check("4. 0 erori JS", errs === 0);
  await ctx.close();
}
await b.close(); console.log(`\n${passes} reușite, ${fails} eșuate`); process.exit(fails ? 1 : 0);
