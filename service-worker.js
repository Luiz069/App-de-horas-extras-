const CACHE_NAME = "horas-extras-v2";

const FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json"
];

// Instala
self.addEventListener("install", (event) => {

  self.skipWaiting();

  event.waitUntil(

    caches.open(CACHE_NAME)

      .then(cache => cache.addAll(FILES))

  );

});


// Ativa
self.addEventListener("activate", (event) => {

  event.waitUntil(

    caches.keys()

      .then(keys =>

        Promise.all(

          keys

            .filter(key => key !== CACHE_NAME)

            .map(key => caches.delete(key))

        )

      )

      .then(() => self.clients.claim())

  );

});


// Busca
self.addEventListener("fetch", (event) => {

  event.respondWith(

    fetch(event.request)

      .then(response => {

        const copia = response.clone();

        caches.open(CACHE_NAME)

          .then(cache => cache.put(event.request, copia));

        return response;

      })

      .catch(() => caches.match(event.request))

  );

});
