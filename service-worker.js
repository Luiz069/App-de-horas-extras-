// ===============================
// Service Worker
// Controle de Horas Extras
// ===============================

const CACHE = "horas-extras-v1";

const ARQUIVOS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(ARQUIVOS);
    }),
  );
});

self.addEventListener("fetch", (evento) => {
  evento.respondWith(
    caches.match(evento.request).then((resposta) => {
      return resposta || fetch(evento.request);
    }),
  );
});

// Busca arquivos do cache primeiro
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)

      .then((response) => {
        return response || fetch(event.request);
      }),
  );
});

// ===============================
// Registrar Service Worker
// ===============================

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then(() => {
        console.log("Service Worker registrado com sucesso.");
      })
      .catch((erro) => {
        console.log("Erro ao registrar:", erro);
      });
  });
}
