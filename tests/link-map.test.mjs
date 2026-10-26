// Teste v2.0.0: hartă de legături a memoriei (stele/constelații după #etichete, căutare, filtre, scene, export imagine).
// Rulează: node tests/link-map.test.mjs
import {launch, check, summary, hOverflow, AXE} from "./_lib.mjs";
import fs from "fs";
const mem = (id, text) => ({id, text, createdAt: 1});
const STATE = {
  activeId: "c1",
  companions: [{id: "c1", name: "Lyra", type: "prieten", traits: "", backstory: "", messages: [], threads: {},
    memories: {
      permanente: [mem("p1", "loves #music and #jazz"), mem("p2", "plays #music on weekends"), mem("p3", "no tag here")],
      evolutive: [mem("e1", "learning #jazz piano"), mem("e2", "works on #project Atlas"), mem("e3", "#project deadline friday")],
      descoperite: [mem("d1", "mentioned #Music festival"), mem("d2", "lonely #solo tag")]
    }, createdAt: 1}],
  settings: {lang: "en"}
};
const {browser, page, st} = await launch();
await page.addInitScript({content: AXE});
await page.evaluate(s => localStorage.setItem("constelar_state_v1", JSON.stringify(s)), STATE);
await page.reload(); await page.waitForTimeout(900);
await page.click("#btnMemoryTab"); await page.waitForTimeout(300);

check("modul orbite activ implicit, controalele hărții ascunse", (await page.getAttribute("#btnViewOrbit", "aria-pressed")) === "true" && await page.locator("#mapControls").isHidden());
await page.click("#btnViewMap"); await page.waitForTimeout(300);
check("hartă activă: controale vizibile", await page.locator("#mapControls").isVisible() && (await page.getAttribute("#btnViewMap", "aria-pressed")) === "true");
const chips = await page.locator("#mapTags button").allTextContents();
check("constelații calculate din #etichete (music 3, jazz 2, project 2; 'solo' singur nu)", JSON.stringify(chips) === JSON.stringify(["All", "#music (3)", "#jazz (2)", "#project (2)"]), chips);
check("rezumat: 8 stele, 3 constelații", /8 of 8 stars · 3 constellations/.test(await page.textContent("#mapCount")), await page.textContent("#mapCount"));
// canvas desenat
const painted = async () => page.evaluate(() => { const c = document.getElementById("constellationCanvas"); const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n; });
check("canvasul are pixeli desenați", (await painted()) > 200);
// filtru pe constelație
await page.click('#mapTags button[data-tag="jazz"]'); await page.waitForTimeout(150);
check("filtru #jazz: 2 stele aprinse", /2 of 8 stars/.test(await page.textContent("#mapCount")) && (await page.getAttribute('#mapTags button[data-tag="jazz"]', "aria-pressed")) === "true");
await page.click('#mapTags button[data-tag=""]');
// căutare
await page.fill("#mapQ", "festival"); await page.waitForTimeout(100);
check("căutare text: 1 stea", /1 of 8 stars/.test(await page.textContent("#mapCount")));
await page.fill("#mapQ", "#music"); await page.waitForTimeout(100);
check("căutare după #etichetă (cu #): 3 stele", /3 of 8 stars/.test(await page.textContent("#mapCount")));
await page.fill("#mapQ", "");
// categorie
await page.selectOption("#mapCat", "evolutive"); await page.waitForTimeout(100);
check("filtru de categorie: 3 stele evolutive", /3 of 8 stars/.test(await page.textContent("#mapCount")));
await page.click('#mapTags button[data-tag="project"]'); await page.waitForTimeout(100);
check("categorie + etichetă se combină (project în evolutive = 2)", /2 of 8 stars/.test(await page.textContent("#mapCount")));

// scene
await page.click("#mapSceneSave"); await page.waitForTimeout(100);
check("salvare scenă fără nume refuzată", /Give the scene a name/.test(await page.textContent("#mapCount")));
await page.fill("#mapSceneName", "Proiecte noi"); await page.click("#mapSceneSave"); await page.waitForTimeout(150);
let stg = await page.evaluate(() => JSON.parse(localStorage.getItem("constelar_state_v1")).companions[0].scenes);
check("scena salvată în stare (q, cat, tag)", stg.length === 1 && stg[0].name === "Proiecte noi" && stg[0].cat === "evolutive" && stg[0].tag === "project", stg);
await page.selectOption("#mapCat", "all"); await page.click('#mapTags button[data-tag=""]'); await page.waitForTimeout(100);
check("resetat: toate stelele aprinse", /8 of 8 stars/.test(await page.textContent("#mapCount")));
await page.selectOption("#mapScene", {index: 1}); await page.waitForTimeout(150);
check("încărcarea scenei restabilește filtrele", /2 of 8 stars/.test(await page.textContent("#mapCount")) && (await page.inputValue("#mapCat")) === "evolutive");

// click pe stea → popover
await page.selectOption("#mapCat", "all"); await page.click('#mapTags button[data-tag=""]');
const box = await page.locator("#constellationCanvas").boundingBox();
const pos = await page.evaluate(() => { const c = document.getElementById("constellationCanvas"); return {w: c.getBoundingClientRect().width, h: c.getBoundingClientRect().height}; });
// găsim o stea căutând popover pe o grilă de puncte
let found = false;
for (let gx = 0.12; gx < 0.9 && !found; gx += 0.04) for (let gy = 0.1; gy < 0.9 && !found; gy += 0.04) { await page.mouse.click(box.x + box.width * gx, box.y + box.height * gy); if (await page.locator("#memNodePopover").isVisible()) found = true; }
check("click pe stea deschide popover cu textul amintirii", found && (await page.textContent("#memNodePopover .mem-node-text")).length > 3);
if (found) await page.click("#memNodeCloseBtn");

// export imagine
const dl = page.waitForEvent("download"); await page.click("#mapExport");
const file = await (await dl).path(); const buf = fs.readFileSync(file);
check("export PNG valid (semnătură + dimensiune)", buf.slice(1, 4).toString() === "PNG" && buf.length > 3000, buf.length);

// adăugare amintire nouă cu #etichetă actualizează harta
await page.fill('.add-memory-form[data-cat="permanente"] input', "likes #jazz clubs"); await page.press('.add-memory-form[data-cat="permanente"] input', "Enter"); await page.waitForTimeout(300);
const chips2 = await page.locator("#mapTags button").allTextContents();
check("amintire nouă cu #jazz: constelația crește la 3", chips2.includes("#jazz (3)"), chips2);
// ștergere
await page.locator("#listPermanente button").last().click(); await page.waitForTimeout(300);
check("ștergerea unei amintiri actualizează harta", (await page.locator("#mapTags button").allTextContents()).includes("#jazz (2)"));

// limbi: toate cele 8 au textele
for (const l of ["ro", "fr", "it", "es", "pt", "de", "hu", "en"]) {
  await page.evaluate(([lg]) => { const s = JSON.parse(localStorage.getItem("constelar_state_v1")); s.settings.lang = lg; localStorage.setItem("constelar_state_v1", JSON.stringify(s)); }, [l]);
  await page.reload(); await page.waitForTimeout(700); await page.click("#btnMemoryTab"); await page.click("#btnViewMap"); await page.waitForTimeout(200);
  const lbl = await page.textContent("#btnViewMap"), cnt = await page.textContent("#mapCount");
  check(`${l}: texte hartă traduse (${lbl})`, (l === "en" ? lbl === "Link map" : lbl !== "Link map") && /\d/.test(cnt) && !/\{(lit|total|groups)\}/.test(cnt), [lbl, cnt]);
}
// a11y + mobil
await page.setViewportSize({width: 390, height: 800}); await page.waitForTimeout(300);
const small = await page.evaluate(() => [...document.querySelectorAll("#mapControls button,#mapControls input,#mapControls select,.map-mode")].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.height < 43.5); }).map(e => e.id || e.className));
check("controale hartă ≥44px pe mobil", small.length === 0, small);
check("fără depășire orizontală", (await hOverflow(page)) <= 0);
await page.setViewportSize({width: 1280, height: 800}); await page.waitForTimeout(300);
const ax = await page.evaluate(async () => (await axe.run(document, {resultTypes: ["violations"]})).violations.map(v => v.id + ":" + v.nodes.map(n => n.target).join("|").slice(0, 100)));
check("axe fără încălcări în vederea hărții", ax.length === 0, ax);
check("fără erori JS/CSP", st.errs.length === 0 && (await page.evaluate(() => window.__csp.length)) === 0, [st.errs, await page.evaluate(() => window.__csp)]);
await browser.close(); summary();
