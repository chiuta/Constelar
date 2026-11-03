# Jurnal de modificări

## 2.1.4 — 2026-11-03

Etapa 9: versiunea API Anthropic (anthropic-version 2026-10-21, verificată în documentația oficială la 2026-11-03) și modelele vin dintr-un singur loc, nucleul AI comun (FFF.ai); temperature/top_p/top_k nu se mai trimit niciodată (eliminate în 2026-10-21); modele retrase înlocuite.

## 2.1.3 — 2026-11-03

Accesibilitate: meniul „Trimite către…” / „Primește…” stă într-un reper ARIA (regula axe «region»); secțiunea seifului folosește h2. Cod comun din hub.

## 2.1.2 — 2026-11-03

Plic FFF (.fff.json) v1: butonul „Trimite către…” (aplicații, fișier, clipboard, cod QR, alte file) și „Primește…”. Cod comun din hub: tools/fff-envelope.js (injectat, nu copiat de mână). Conversația activă se trimite ca text/markdown; se primește în caseta de scris.

## 2.1.1 — 2026-11-02 (reîmprospătare kit)

- Nou (kit): **Sincronizare între dispozitive** (`FFF.sync`) — în dialogul «Transparență» (clic pe versiune → Copie de siguranță): conectezi două dispozitive direct (WebRTC, cod/QR, fără server și fără cont) și își schimbă datele aplicației; cea mai recentă valoare câștigă, secretele (chei API, parole) nu se trimit, ștergerile nu se propagă. Aplicarea trece prin importul kitului (confirmare, chei permise, rollback).
- Nou (kit): **Istoric local — «mașina timpului»** (`FFF.history`) — instantanee automate ale datelor (IndexedDB, fără secrete), diferență față de starea curentă și restaurare reversibilă; «Șterge datele aplicației» șterge și istoricul.
- Module adăugate: `qr`, `p2p`, `sync`, `history` (+~140 KB). Versiunea aplicației nu se schimbă.

## 2.1.1 — 2026-11-02

### Surse actualizate (runda 2, verificat la 2026-11-02)
- README (8 limbi): Pollinations precizat — API-ul clasic anonim e limitat pe IP și fără garanție de disponibilitate; noul gen.pollinations.ai cere cheie (verificat în APIDOCS.md al proiectului).
- Eticheta Pollinations („gratuit, fără cont și fără cheie”) completată în toate cele 8 limbi cu „cereri limitate”: accesul anonim există, dar este limitat (documentația Pollinations din iulie 2026; noua documentație folosește `gen.pollinations.ai` cu chei `pk_`/`sk_`). Punctul final `text.pollinations.ai` rămâne neschimbat; starea lui pe termen lung nu a putut fi confirmată din sursa oficială.

## 2.1.0 — 2026-10-31

### Securitate
- **Seif opțional cu parolă pentru cheia API „ținută minte”** (KeyVault 1.0.0: AES-256-GCM + PBKDF2-SHA256, 600 000 de iterații, sare aleatoare; aceeași componentă ca în ARENA, AI-Liber și Nexus, copiată identic). Cu seiful activ, cheia nu mai ajunge în clar nici în `localStorage`, nici în `sessionStorage`; la deschidere se cere parola. Fără seif, comportamentul rămâne cel de până acum (inclusiv avertismentul „necriptat”).
- Componenta rămâne **neauditată de un terț**; protecția nu ajută împotriva unui script rău intenționat care rulează pe aceeași origine cât seiful e deblocat.
- Copia de rezervă necriptată nu include blobul seifului.
- Test nou: `tests/keyvault-ui.test.mjs` (16 verificări: activare, absența cheii în clar, deblocare cu parolă greșită/corectă, salvare cu seiful deblocat, dezactivare). Testele existente `api-key-storage`, `memory-clear`, `a11y-touch` trec; `link-map` pică la fel și pe codul anterior (eroare de harness la `addInitScript`).
- `fff.config.json` declară cheile de stocare (inclusiv `constelar_apikey_vault`); `sw.js`: cache v7 → v8.

## 2.0.1 — 2026-10-27

Recenzie 2026-10-27.

### Adăugat
- Buton „Șterge toată memoria acestui companion” în fila Memorie (8 limbi), cu confirmare; conversațiile și setările rămân. Nu exista până acum (doar ștergerea unei singure amintiri sau a întregului companion).
- Notă în Setări AI (8 limbi) și în README despre suprapunerea parțială cu AI-Liber, cu legătură către AI-Liber (se deschide doar la clic).
- Secțiune în README: unde se păstrează memoria (`localStorage`, `constelar_state_v1`) și cum se șterge.
- `tests/memory-clear.test.mjs`; linii „Stare” și „Offline” în README și metadate.

### Modificat
- Versiune 2.0.1; cache-ul service worker-ului `v6` → `v7`; hash-urile CSP ale scripturilor inline recalculate.

### Neschimbat
- Nimic șters; fără dependențe noi.

Istoricul anterior (până la 2.0.0, 2026-10-26) este în secțiunea „Istoric / Changelog” din README.md.
