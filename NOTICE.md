# Componente terțe și licențe

`index.html` conține codul propriu al Constelar (vezi `LICENSE`). Bibliotecile terțe își păstrează licențele proprii.
Nicio bibliotecă nu se mai încarcă de pe un CDN (`esm.run` și `cdn.jsdelivr.net` nu mai sunt în `script-src`). WebLLM este opțional și se încarcă doar când alegi furnizorul „în browser”.

## În depozit (`vendor/`)

| Componentă | Fișier | Licență | SHA-256 |
|---|---|---|---|
| [WebLLM](https://github.com/mlc-ai/web-llm) 0.2.84 (`@mlc-ai/web-llm`), împachetat cu esbuild 0.28.2 (`--minify --format=esm --target=es2020`) din pachetul npm; include ~5,6 MB de WebAssembly codificat base64 | `vendor/web-llm@0.2.84/web-llm.min.js` | Apache-2.0 (`vendor/web-llm@0.2.84/LICENSE`) | `04ed20073fb2aecdedd3eb1d7d636dbde1e4839f13b7f85b852f3b76b260eb47` |
| Worker WebLLM (cod propriu, 3 rânduri: `WebWorkerMLCEngineHandler`) | `vendor/web-llm-worker.mjs` | ca aplicația (vezi `LICENSE`) | `8e76aa8211eec20e0e347f9aedbdc33d42c18f5fbbba7d08b10f4d48f6f4ade7` |

## Descărcate la cerere, cu integritate verificată

| Componentă | URL (fixat) | Verificare |
|---|---|---|
| Biblioteci de model WebLLM (`*-webgpu.wasm`, ~5 MB; Apache-2.0) pentru cele 3 modele din listă (Llama 3.2 1B, 3.2 3B, 3.1 8B q4f32_1) | `https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/00fe7a40e57e5e8eb9fef87526a4bf28ad5846c0/web-llm-models/v0_2_84/base/<fișier>.wasm` | WebLLM (în worker) compară SHA-256 (tabela `WLLM_LIBS` din `index.html`); la nepotrivire `IntegrityError`, iar aplicația arată un mesaj tradus. Modelele fără intrare în tabel (inclusiv ID-uri introduse manual) nu sunt disponibile. |

Verificat funcțional cu un server local care servește fișierele reale (corect => trece; un bit schimbat => refuzat).

## Descărcate la cerere, fără hash fixat

| Componentă | Când | Notă |
|---|---|---|
| Greutăți/configurație model (`huggingface.co/mlc-ai/<model>/resolve/main/...`, redirecționate către `*.huggingface.co` / `*.hf.co`) | doar la folosirea WebLLM | Date, nu cod; sute de MB până la GB; fără revizie/hash fixat (Hugging Face nu era accesibil la pregătire). |
| API-uri ale furnizorilor și adrese proprii (Base URL liber, Ollama/LM Studio pe loopback) | doar la o acțiune a ta | `connect-src` rămâne `'self' https: http://localhost:* http://127.0.0.1:*`: adresele sunt alese de utilizator, deci nu pot fi enumerate. |

Notă: worker-ul se încarcă din `vendor/` (URL de aceeași origine), deci politica CSP din `<meta>` nu i se aplică; protecția lui este integritatea bibliotecilor de model (SRI) și faptul că rulează cod din depozit.
