// Constelar — regresie: ținte tactile ≥44px la 390px și nume accesibil pentru câmpurile cu doar placeholder.
// Rulare: node tests/a11y-touch.test.mjs [calea/spre/index.html]
import {createRequire} from "module"; import path from "path"; import {fileURLToPath} from "url";
const require = createRequire(process.env.PW_ROOT || import.meta.url); const {chromium} = require("playwright");
const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILE = "file://" + path.resolve(process.argv[2] || path.join(HERE, "..", "index.html"));
let fails = 0, passes = 0; const check = (n, c, x) => { c ? (passes++, console.log("  ok  " + n)) : (fails++, console.log("FAIL  " + n + (x !== undefined ? "  -> " + JSON.stringify(x) : ""))); };
const b = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined});
const ctx = await b.newContext({viewport: {width: 390, height: 800}});
const p = await ctx.newPage(); const errs = []; p.on("pageerror", e => errs.push(String(e)));
await p.goto(FILE); await p.waitForTimeout(1200);
const small = await p.evaluate(() => [...document.querySelectorAll("button,select,input:not([type=hidden])")]
  .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 43.5 || r.width < 43.5); }).map(e => e.id || e.className));
check("butoane/câmpuri vizibile ≥44px", small.length === 0, small);
check("fără depășire orizontală", await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
const unnamed = await p.evaluate(() => [...document.querySelectorAll("input[placeholder],textarea[placeholder]")].filter(e => !e.getAttribute("aria-label") && !(e.labels && e.labels.length)).map(e => e.placeholder));
check("câmpurile cu placeholder au aria-label", unnamed.length === 0, unnamed);
check("0 erori JS", errs.length === 0, errs);
await b.close(); console.log(`\n${passes} reușite, ${fails} eșuate`); process.exit(fails ? 1 : 0);
