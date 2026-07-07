
const NOM_CACHE = 'gescom-avenir-v1';
const FICHIERS_A_METTRE_EN_CACHE = [
  './',
  './index.html'
];

self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(NOM_CACHE).then(function(cache) {
      return cache.addAll(FICHIERS_A_METTRE_EN_CACHE);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(noms) {
      return Promise.all(
        noms.filter(function(nom) { return nom !== NOM_CACHE; })
            .map(function(nom) { return caches.delete(nom); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(reponse) {
      if (reponse) {
        return reponse;
      }
      return fetch(event.request).then(function(reponseReseau) {
        return caches.open(NOM_CACHE).then(function(cache) {
          if (event.request.method === 'GET' && reponseReseau.status === 200) {
            cache.put(event.request, reponseReseau.clone());
          }
          return reponseReseau;
        });
      }).catch(function() {
        return caches.match('./index.html');
      });
    })
  );
});
