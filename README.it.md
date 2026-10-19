# Constelar

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · **Italiano** · [Español](README.es.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

**Versione:** 1.3.0 · **Ultimo aggiornamento:** 2026-10-19

Lingue dell'interfaccia: **Română, English, Français, Italiano, Español, Português (PT), Deutsch, Magyar**

Compagni IA con una memoria reale, archiviata localmente nel browser, in un unico file HTML.

**Applicazione online:** https://chiuta.github.io/Constelar/

![Schermata](screenshot.png)

## Che cos'è

Constelar è un'applicazione (PWA facoltativa) in cui crei uno o più «compagni» IA (famiglia, amico, romantico, storia / gioco di ruolo), ciascuno con una propria personalità, un contesto e una memoria propria visualizzata come una costellazione. I dati restano nel browser; nulla lascia il dispositivo, a meno che tu non scelga un fornitore IA esterno o scarichi un modello WebLLM. L'applicazione è pensata per gli adulti e non sostituisce le relazioni umane né la terapia (nota nell'applicazione).

## Funzionalità

- Più compagni: nome, tipo di relazione, tratti, contesto / storia di fondo, fornitore IA proprio o quello globale; pulsante per generare un compagno a caso.
- Due schede per ogni compagno: **Chat** e **Memory**. La memoria ha tre categorie: *Permanent*, *Evolving*, *Discovered* (quest'ultima con estrazione automatica facoltativa), mostrate come stelle che puoi toccare per i dettagli.
- Fornitori IA nelle Impostazioni: WebLLM (modello eseguito nella scheda tramite WebGPU, scaricato una volta, varianti 1B / 3B / 8B), Anthropic (Claude), compatibile OpenAI (preimpostazioni Groq, OpenRouter, Together, Mistral, DeepSeek, xAI, Ollama), Pollinations (senza account), Gemini Nano nativo di Chrome e un semplice motore locale basato su regole (non è una rete neurale; etichettato come tale nella chat).
- «Test connection», promemoria «It's AI» a intervallo configurabile (minuti; 0 = disattivato), lettura ad alta voce delle risposte (speechSynthesis).
- Estrazione locale di fatti dai messaggi (preferenze, paure, persone e animali vicini, occupazione, abitazione) nelle 8 lingue, mostrati in «Discovered».
- Riepilogo della conversazione («Conversation recap», calcolato localmente in base alla frequenza delle parole) ed esportazione di una conversazione.
- Esportazione / importazione di tutti i dati (⇩ / ⇧).
- Pulsante «Copia il messaggio» (⧉) su ogni messaggio; le bozze nel campo del messaggio vengono conservate per compagno (anche dopo il ricaricamento).
- Risorse di crisi accessibili dalla barra laterale e finestra di sicurezza quando vengono rilevate certe espressioni.
- Menu «Share» (link, WhatsApp, X, Facebook, LinkedIn, Fediverso).
- Interfaccia in 8 lingue: inglese, rumeno, francese, italiano, spagnolo, portoghese, tedesco, ungherese.

## Guida all'uso

1. Apri la pagina e premi «+ New companion» (o «+ Create your first companion»).
2. Compila nome, tipo di relazione, tratti e contesto; scegli il fornitore IA («Same as Settings (global)» o un altro), poi «Create».
3. Nella scheda **Chat** scrivi il messaggio e premi «Send» o `Enter` (`Shift+Enter` per andare a capo).
4. Nella scheda **Memory** aggiungi ricordi con «+» nelle categorie Permanent / Evolving / Discovered.
5. Per un'IA reale, apri ⚙ (AI Settings), scegli «Provider», inserisci la chiave API (e, se serve, «Base URL» / «Model»), usa «Test connection», poi «Save». Per WebLLM premi «Download and start the model».
6. Cambia la lingua dal pulsante 🌐 o dal selettore «Language» nelle Impostazioni.
7. Salva i dati con ⇩ (esportazione) e ripristinali con ⇧ (importazione).
8. `Esc` chiude le finestre modali. ℹ apre «About Constelar» e i termini/la privacy.

## Privacy e rete

- **Archiviazione locale:** `localStorage`, chiave `constelar_state_v1` (compagni, ricordi, conversazioni, impostazioni; compresa la chiave API se la inserisci). Le bozze dei messaggi non inviati sono conservate separatamente, nella chiave `constelar_drafts_v1` (eliminate all'invio). L'applicazione verifica la disponibilità di `localStorage` e avvisa se non funziona. Nessun cookie.
- **Host contattati, solo su tua azione:**
  - il fornitore IA scelto: `api.anthropic.com`, `api.openai.com` o un altro Base URL (compreso `openrouter.ai` nelle preimpostazioni), con messaggi e chiave inviati direttamente dal browser;
  - `text.pollinations.ai`, se scegli Pollinations (l'applicazione chiede il consenso una sola volta);
  - `esm.run` (CDN), per caricare la libreria `@mlc-ai/web-llm@0.2.84`, e poi scaricare il modello scelto, se usi WebLLM;
  - i link a `iasp.info` (risorse di crisi) e i pulsanti «Share» si aprono solo al clic.
- Nessuno strumento di analisi. La pagina ha una policy CSP (meta), con `script-src` tramite hash SHA-256 per lo script proprio (senza `'unsafe-inline'`); `connect-src` consente `https:` perché l'URL del fornitore compatibile OpenAI è scelto dall'utente. I nomi dei modelli nelle preimpostazioni (Groq, OpenRouter, Together, Mistral ecc.) cambiano spesso e non è stato possibile verificarli all'11.10.2026: modifica il campo «Model» se un fornitore risponde con un errore. Con il fornitore predefinito «semplice motore locale» o con modelli già scaricati, le conversazioni non lasciano il dispositivo.
- Quando è servito via HTTPS, `sw.js` (facoltativo) si registra e mette in cache l'«app shell»; non tocca `localStorage`.

## Esecuzione in locale / offline

Scarica `index.html` (facoltativamente anche `sw.js`, per l'installazione come applicazione su un server HTTPS) e aprilo nel browser. Senza internet funzionano il semplice motore locale e i modelli WebLLM già scaricati nella cache; i fornitori esterni e il primo download di WebLLM richiedono internet.

## Licenza

MIT per il codice e la struttura dell'applicazione — vedi il file `LICENSE`. Eventuali librerie di terze parti incluse nel file mantengono le proprie licenze. I contenuti creati dall'utente restano suoi.

## Audit

Audit: 2026-10-10 — verificato con Playwright e axe-core; i rendering dei contenuti (messaggi, ricordi, riepilogo) usano `escapeHtml` (testato con un payload `<img onerror>`); l'esportazione dei dati svuota la chiave API. Corretto: la barra superiore su schermo stretto (la scheda «Memory» usciva dallo schermo). Giro 2 (2026-10-11): la dicitura «100% locale» compariva solo nel campo «About» su GitHub, non nella pagina; il testo della pagina (meta description, «stored locally», impostazioni) è esatto: i dati restano nel browser, e il testo parte verso un'IA esterna, verso Pollinations o verso il CDN `esm.run` (WebLLM) solo se scegli quel fornitore. Testo corretto per «About» (da applicare manualmente su GitHub): «Compagni IA con memoria archiviata localmente nel browser; i messaggi partono verso un fornitore esterno solo se lo scegli tu.» Nessuna CSP e nessuna SRI su WebLLM: l'`import()` dinamico da `esm.run` non può portare l'attributo `integrity`, e `connect-src` dovrebbe consentire qualsiasi host scelto dall'utente (Base URL libero), quindi una CSP utile sarebbe ampia quanto la sua assenza.

## Cronologia / Changelog

### 1.2.0 — 2026-10-18
- Corretto: l'importazione di un file di compagni senza `settings` non reimposta più lingua, fornitore e modello (restano quelli correnti).
- La copia di riserva non cifrata (kit 1.1.0) non contiene più la chiave API; quella cifrata con password la conserva. Al ripristino di una copia non cifrata, la chiave va reinserita.

### 1.1.0 — 2026-10-14
- Copia di riserva ed etichettatura dei dati (fff-kit).

### 1.0.0 — 2026-10-12
- La versione e la data dell'ultimo aggiornamento sono mostrate nell'applicazione (finestra «About», in 7 lingue).

### 11 ottobre 2026 (giro 7)
- Corretto: a «cosa ricordi di me?» il motore locale cita ora solo fatti reali sull'utente; la nota di benvenuto del compagno dimostrativo in «Discovered» («Right now she's chatting through the instant local engine…») è stata contrassegnata come suggerimento (`hint`) ed esclusa dalla risposta di richiamo, dal prompt inviato all'IA e dai riferimenti del motore locale (anche per i dati salvati in precedenza, riconosciuta dal testo). Riprodotto e verificato nel browser.
- Migliorato: estrazione euristica dei fatti, in tutte le 7 lingue: «iubesc/I love/j'adore…», «mi-e frică de/I'm afraid of/j'ai peur de…», relazioni e animali con nome («my friend Maria»), e la frase trattenuta viene tagliata alla prima congiunzione («hiking and I'm afraid…» → «hiking»). Il motore resta euristico e limitato.

### 11 ottobre 2026 (giro 6)
- Aggiunto: pulsante di copia su ogni messaggio (tradotto in 7 lingue), bozze persistenti per compagno.
- Sicurezza: CSP con `script-src` tramite hash al posto di `'unsafe-inline'` (fonti esterne invariate: `esm.run`, `cdn.jsdelivr.net`).

### 11 ottobre 2026
- Corretto: il motore locale basato su regole risponde ora alle domande sull'utente («What is my name?», «Cine sunt?», «Que sais-tu de moi ?» ecc., in tutte le 7 lingue) con i fatti «scoperti» in memoria; senza fatti, dice esplicitamente di non avere nulla in memoria.
- Corretto: i riepiloghi dei fatti (la conferma «Good to know …» e i fatti estratti automaticamente) non vengono più tagliati a metà parola o all'apostrofo (limite 30 → 80/60 caratteri, con ripiego sull'ultima parola intera).
- Aggiunto: policy CSP (connect-src `'self'`, `https:` per i fornitori IA configurabili dall'utente e HTTP loopback per Ollama/LM Studio; script solo da `esm.run`/`cdn.jsdelivr.net` per WebLLM).
- Corretto: accessibilità: titolo h1, finestre modali con nome, contrasto per l'ora dei messaggi; 0 violazioni axe-core a 1280 e 360 px.

## Autore

Alexio — Alexandru-Ionuț Chiuță. Contatto: alexio@trom.tf

## Riepilogo

Constelar è un'applicazione in un unico file per compagni IA con memoria locale e visibile (permanent / evolving / discovered). I dati risiedono in localStorage (`constelar_state_v1`). Fornitori IA: WebLLM nella scheda, Anthropic, compatibile OpenAI, Pollinations, Gemini Nano di Chrome, o un semplice motore locale basato su regole. Gli host esterni vengono contattati solo quando li scegli (API dei fornitori, CDN esm.run per WebLLM, Pollinations). Interfaccia in 8 lingue.
