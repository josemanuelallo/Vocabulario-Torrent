const CACHE_NAME = "vocabulario-latin-v4";

const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icono.png",
  "./CSS/estilos.css?v=3",
  "./js/vocabulario-datos.js?v=4",
  "./js/app.js?v=4",

  "./Vocabulario/Torrent/Tema1.txt",
  "./Vocabulario/Torrent/Tema2.txt",
  "./Vocabulario/Torrent/Tema3.txt",
  "./Vocabulario/Torrent/Tema4.txt",
  "./Vocabulario/Torrent/Tema5.txt",
  "./Vocabulario/Torrent/Tema6.txt",
  "./Vocabulario/Torrent/Tema7.txt",
  "./Vocabulario/Torrent/Tema8.txt",
  "./Vocabulario/Torrent/Tema9.txt",
  "./Vocabulario/Torrent/Tema10.txt",
  "./Vocabulario/Torrent/Tema11.txt",
  "./Vocabulario/Torrent/Tema12.txt",
  "./Vocabulario/Torrent/Tema13.txt",
  "./Vocabulario/Torrent/Tema14.txt",
  "./Vocabulario/Torrent/Tema15.txt",
  "./Vocabulario/Torrent/Tema16.txt",
  "./Vocabulario/Torrent/Tema17.txt",
  "./Vocabulario/Torrent/Tema18.txt",
  "./Vocabulario/Torrent/Tema19.txt",
  "./Vocabulario/Torrent/Tema20.txt",
  "./Vocabulario/Torrent/Tema21.txt",
  "./Vocabulario/Torrent/Tema22.txt",
  "./Vocabulario/Torrent/Tema23.txt",
  "./Vocabulario/Torrent/Tema24.txt",
  "./Vocabulario/Torrent/Tema25.txt",
  "./Vocabulario/Torrent/Tema26.txt",
  "./Vocabulario/Torrent/Tema27.txt",
  "./Vocabulario/Torrent/Tema28.txt",
  "./Vocabulario/Torrent/Tema29.txt",
  "./Vocabulario/Torrent/Tema30.txt",
  "./Vocabulario/Torrent/Tema31.txt",
  "./Vocabulario/Torrent/Tema32.txt",
  "./Vocabulario/Torrent/Tema33.txt",
  "./Vocabulario/Torrent/Tema34.txt",
  "./Vocabulario/Torrent/Tema35.txt",
  "./Vocabulario/Torrent/Tema36.txt",
  "./Vocabulario/Torrent/Tema37.txt",
  "./Vocabulario/Torrent/Tema38.txt",
  "./Vocabulario/Torrent/Tema39.txt",
  "./Vocabulario/Torrent/TotalTorrent.txt"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
});
