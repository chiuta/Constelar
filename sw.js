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
 * constelar.html, pe un server real (ex. GitHub Pages, Netlify,
 * orice hosting cu HTTPS). Deschis direct ca fișier local
 * (file://), acest worker nu se înregistrează deloc — aplicația
 * funcționează normal mai departe, exact ca înainte, doar fără
 * beneficiul de "instalare" completă ca aplicație.
 *
 * Nu e nicio magie ascunsă aici: șterge fișierul dacă nu-l
 * vrei — Constelar funcționează identic fără el.
 */

const CACHE_NAME = "constelar-shell-v1";
const SHELL_URL = "./constelar.html";

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
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // rețea disponibilă: răspundem cu ce vine din rețea și
        // actualizăm cache-ul silențios pentru viitor, offline
        var copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => {
        // rețea indisponibilă: incercăm cache-ul exact, apoi shell-ul ca fallback general
        return caches.match(event.request).then((cached) => cached || caches.match(SHELL_URL));
      })
  );
});
