# Jurnal de modificări

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
