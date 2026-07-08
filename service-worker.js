// ===============================
// Service Worker
// Controle de Horas Extras
// ===============================

const CACHE_NAME = "horas-extras-v1";

const FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json"
];

// Instala o Service Worker
self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)

        .then(cache => {

            return cache.addAll(FILES);

        })

    );

    self.skipWaiting();

});

// Ativa o Service Worker
self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()

        .then(keys => {

            return Promise.all(

                keys.map(key => {

                    if(key !== CACHE_NAME){

                        return caches.delete(key);

                    }

                })

            );

        })

    );

    self.clients.claim();

});

// Busca arquivos do cache primeiro
self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)

        .then(response => {

            return response || fetch(event.request);

        })

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
            .catch(erro => {

                console.log("Erro ao registrar:", erro);

            });

    });

}