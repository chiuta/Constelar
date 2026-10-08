/*
 * sw.js — Service Worker opțional pentru Constelar
 * ==================================================
 * De ce există acest fișier separat: Constelar e gândit ca o
 * aplicație single-file, dar un Service Worker NU poate fi
 * înglobat în același fișier HTML — browserele resping explicit
 * blob:/data: ca sursă de script pentru Service Worker, indiferent
 * de context (verificat concret, inclusiv pe HTTP real, nu doar
 * pe file://). E o restricție de platformă, nu o limitare a
 * aplicației.
 *
 * Ce face: cache "app shell" — prima vizită online salvează
 * pagina, vizitele următoare (inclusiv offline) o servesc din
 * cache dacă rețeaua nu răspunde. Nu interferează cu localStorage
 * (memoria companionilor) — acela rămâne mecanismul de stocare
 * a datelor, neschimbat.
 *
 * Cum se folosește: pune acest fișier ÎN ACELAȘI FOLDER cu
 * index.html, pe un server real (ex. GitHub Pages, Netlify,
 * orice hosting cu HTTPS). Deschis direct ca fișier local
 * (file://), acest worker nu se înregistrează deloc — aplicația
 * funcționează normal mai departe, exact ca înainte, doar fără
 * beneficiul de "instalare" completă ca aplicație.
 *
 * Nu e nicio magie ascunsă aici: șterge fișierul dacă nu-l
 * vrei — Constelar funcționează identic fără el.
 */

const CACHE_PREFIX = "constelar-shell-";
const CACHE_NAME = CACHE_PREFIX + "v2";
const SHELL_URL = "./index.html";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // nu eșuăm instalarea dacă fetch-ul inițial dă greș (ex. offline la prima instalare) —
      // worker-ul tot se instalează, doar fără cache pre-populat încă
      return cache.add(SHELL_URL).catch(() => {});
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        // ȘTERGE DOAR cache-urile acestui worker: pe același origin (github.io) trăiesc și cache-urile
        // altor aplicații și ale WebLLM („webllm/model" etc., gigaocteți) — nu le atingem
        names.filter((n) => n.indexOf(CACHE_PREFIX) === 0 && n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  // doar resurse de pe același origin: CDN-ul WebLLM / greutățile modelului (alt origin, uneori
  // GB) nu trebuie interceptate sau duplicate în cache-ul shell-ului
  var url;
  try { url = new URL(event.request.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // rețea disponibilă: răspundem cu ce vine din rețea și actualizăm cache-ul
        // silențios — doar răspunsuri 200 de bază (nu 404/5xx, nu 206 parțiale)
        if (response && response.ok && response.status === 200 && response.type === "basic") {
          var copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() => {
        // rețea indisponibilă: cache-ul exact; shell-ul doar ca fallback pentru navigări
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === "navigate") return caches.match(SHELL_URL);
          return Response.error();
        });
      })
  );
});
