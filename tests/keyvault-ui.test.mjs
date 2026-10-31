// Constelar — seiful opțional cu parolă (KeyVault 1.0.0): cheia „ținută minte” nu mai stă în clar în localStorage.
// Rulare: PW_ROOT=/opt/node-tools/package.json node tests/keyvault-ui.test.mjs [calea/spre/index.html]
import {createRequire} from "module"; import path from "path"; import {fileURLToPath} from "url";
const require = createRequire(process.env.PW_ROOT || import.meta.url); const {chromium} = require("playwright");
const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILE = "file://" + path.resolve(process.argv[2] || path.join(HERE, "..", "index.html"));
let fails = 0, passes = 0;
const check = (n, c, x) => { c ? (passes++, console.log("  ok  " + n)) : (fails++, console.log("FAIL  " + n + (x !== undefined ? "  -> " + JSON.stringify(x) : ""))); };
const CAN = "sk-VAULTCANARY-789", PW = "parola-foarte-lunga-123";
const b = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--no-sandbox"]});
const lsHas = (p, c) => p.evaluate(c => Object.entries(localStorage).filter(([k, v]) => v.includes(c)).map(([k]) => k), c);
const ssHas = (p, c) => p.evaluate(c => Object.entries(sessionStorage).filter(([k, v]) => v.includes(c)).map(([k]) => k), c);
async function open(ctx) { const p = await ctx.newPage(); p.__e = []; p.on("pageerror", e => p.__e.push(String(e))); await p.goto(FILE); await p.waitForTimeout(900); return p; }
async function save(p, key, remember) {
  if (!(await p.isVisible("#fApiKey"))) await p.click("#btnSettings");
  await p.selectOption("#fProvider", "anthropic");
  await p.fill("#fApiKey", key);
  await p.evaluate(r => { document.getElementById("fRememberKey").checked = r; }, !!remember);
  await p.click('#formSettings button[type=submit]'); await p.waitForTimeout(400);
}
const ctx = await b.newContext({serviceWorkers: "block"}); await ctx.route(/^https?:/, r => r.abort());
const p = await open(ctx);
// 1. fără seif: comportament neschimbat, cheia ținută minte e în clar (cunoscut, avertizat)
await save(p, CAN, true);
check("1. fără seif, cheia ținută minte e în localStorage (comportament vechi)", (await lsHas(p, CAN)).length === 1);
// 2. activare seif din UI
await p.click("#btnSettings");
check("2. cardul seifului e afișat", await p.isVisible("#kv-host .kv-card"));
await p.click("#kv-host button:has-text('Activează'), #kv-host button:has-text('Turn on')");
await p.waitForSelector(".kv-box");
const pws = await p.$$(".kv-box input[type=password]");
check("2. dialogul de creare cere parola de două ori", pws.length === 2);
await pws[0].fill(PW); await pws[1].fill(PW);
await p.click(".kv-box button[type=submit]");
await p.waitForFunction(() => !document.querySelector(".kv-box"), null, {timeout: 20000});
await p.waitForTimeout(500);
check("2. după activare, cheia NU mai e în clar în localStorage", (await lsHas(p, CAN)).length === 0, await lsHas(p, CAN));
check("2. nici în sessionStorage", (await ssHas(p, CAN)).length === 0, await ssHas(p, CAN));
check("2. seiful criptat există", await p.evaluate(() => { const v = localStorage.getItem("constelar_apikey_vault"); return !!v && v.includes('"kv":1') && !v.includes("VAULTCANARY"); }));
// 3. reload: seiful blocat, apare dialogul de deblocare
await p.reload(); await p.waitForSelector(".kv-box", {timeout: 8000});
check("3. la reîncărcare apare dialogul de deblocare", true);
// 3a. parolă greșită
await p.fill(".kv-box input[type=password]", "gresita-gresita-1"); await p.click(".kv-box button[type=submit]");
await p.waitForFunction(() => /greșit|wrong|incorrect|falsch|errad|hib|erron|sbagli/i.test((document.querySelector(".kv-box .kv-st") || {}).textContent || ""), null, {timeout: 20000});
check("3a. parola greșită e respinsă și dialogul rămâne", await p.isVisible(".kv-box"));
// 3b. parola corectă
await p.fill(".kv-box input[type=password]", PW); await p.click(".kv-box button[type=submit]");
await p.waitForFunction(() => !document.querySelector(".kv-box"), null, {timeout: 20000});
await p.click("#btnSettings");
check("3b. după deblocare cheia revine în câmp", await p.inputValue("#fApiKey") === CAN);
check("3b. bifa „ține minte” e bifată", await p.evaluate(() => document.getElementById("fRememberKey").checked));
check("3b. avertismentul „necriptat” e ascuns cât seiful e activ", await p.evaluate(() => document.querySelector('[data-i18n="rememberKeyWarn"]').hidden));
// 4. salvarea unei chei noi cu seiful deblocat merge în seif, nu în clar
const CAN2 = "sk-VAULTCANARY-NEW";
await save(p, CAN2, true);
check("4. cheia nouă nu apare în clar", (await lsHas(p, CAN2)).length === 0 && (await ssHas(p, CAN2)).length === 0);
await p.waitForTimeout(800);
await p.reload(); await p.waitForSelector(".kv-box"); await p.fill(".kv-box input[type=password]", PW); await p.click(".kv-box button[type=submit]");
await p.waitForFunction(() => !document.querySelector(".kv-box"), null, {timeout: 20000});
await p.click("#btnSettings");
check("4. cheia nouă revine din seif după reload+deblocare", await p.inputValue("#fApiKey") === CAN2);
// 5. dezactivare seif: cheia revine în stocarea obișnuită, seiful dispare
await p.click("#kv-host button:has-text('Dezactivează'), #kv-host button:has-text('Turn off')");
await p.waitForSelector(".kv-box"); await p.fill(".kv-box input[type=password]", PW); await p.click(".kv-box button[type=submit]");
await p.waitForFunction(() => !document.querySelector(".kv-box"), null, {timeout: 20000});
await p.waitForTimeout(500);
check("5. seiful a fost șters", await p.evaluate(() => localStorage.getItem("constelar_apikey_vault") === null));
check("5. cheia a revenit în stocarea obișnuită", (await lsHas(p, CAN2)).length === 1);
check("6. fără erori de pagină", p.__e.length === 0, p.__e);
await b.close();
console.log(fails ? `\n${fails} eșuate, ${passes} reușite` : `\nTOATE OK (${passes})`);
process.exit(fails ? 1 : 0);
