// Test 2.0.1: butonul „Șterge toată memoria acestui companion” + nota despre AI-Liber.
// Rulează: node tests/memory-clear.test.mjs
import {launch, check, summary, hOverflow} from "./_lib.mjs";
const mem = (id, text) => ({id, text, createdAt: 1});
const mk = (id, name, n) => ({id, name, type: "prieten", traits: "", backstory: "", messages: [{id: "m" + id, role: "user", text: "salut", ts: 1}], threads: {},
  memories: {permanente: [mem(id + "p", "a")], evolutive: [mem(id + "e", "b")], descoperite: [mem(id + "d", "c")]}, createdAt: 1});
const STATE = {activeId: "c1", companions: [mk("c1", "Lyra"), mk("c2", "Orion")], settings: {lang: "en"}};
const {browser, page, st} = await launch();
await page.evaluate(s => localStorage.setItem("constelar_state_v1", JSON.stringify(s)), STATE);
await page.reload(); await page.waitForTimeout(900);
await page.click("#btnMemoryTab"); await page.waitForTimeout(300);
check("butonul există și e vizibil", await page.locator("#btnMemClear").isVisible());
check("textul butonului", /Delete all memory/.test(await page.locator("#btnMemClear").innerText()));
// anulare
await page.click("#btnMemClear"); await page.waitForTimeout(300);
const dlg = page.locator("dialog[open], [role=dialog]:visible, [role=alertdialog]:visible");
check("apare confirmarea", await dlg.count() > 0);
const cancel = page.locator("[role=dialog]:visible button, [role=alertdialog]:visible button, dialog[open] button").filter({hasText: /cancel|anulează/i}).first();
await cancel.click(); await page.waitForTimeout(300);
let S = await page.evaluate(() => JSON.parse(localStorage.getItem("constelar_state_v1")));
check("după anulare: memoria intactă", S.companions[0].memories.permanente.length === 1);
// confirmare
await page.click("#btnMemClear"); await page.waitForTimeout(300);
const yes = page.locator("[role=dialog]:visible button, [role=alertdialog]:visible button, dialog[open] button").filter({hasText: /delete|wipe|yes|da|șterge/i}).last();
await yes.click(); await page.waitForTimeout(500);
S = await page.evaluate(() => JSON.parse(localStorage.getItem("constelar_state_v1")));
const c1 = S.companions.find(c => c.id === "c1"), c2 = S.companions.find(c => c.id === "c2");
check("memoria companionului activ e goală", !c1.memories.permanente.length && !c1.memories.evolutive.length && !c1.memories.descoperite.length);
check("conversația rămâne", c1.messages.length === 1);
check("celălalt companion neatins", c2.memories.permanente.length === 1 && c2.memories.evolutive.length === 1);
check("fără defilare orizontală", (await hOverflow(page)) <= 0);
// nota AI-Liber în Setări
const note = await page.evaluate(() => { const m = document.getElementById("modalSettings"); return m ? m.textContent : ""; });
check("nota despre AI-Liber în Setări", /AI-Liber/.test(note));
check("nicio cerere de rețea", st.net.length === 0, st.net);
check("fără erori de pagină", st.errs.length === 0, st.errs);
await browser.close(); summary();
