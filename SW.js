
const CACHE_NAME = 'gescom-avenir-v1';
const FICHIERS_A_METTRE_EN_CACHE = [
  './',
  './index.html'
];

self.addEventListener('install', function(event){
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(FICHIERS_A_METTRE_EN_CACHE);
    })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(noms){
      return Promise.all(
        noms.filter(function(nom){ return nom !== CACHE_NAME; })
            .map(function(nom){ return caches.delete(nom); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event){
  event.respondWith(
    caches.match(event.request).then(function(reponseEnCache){
      const recuperationReseau = fetch(event.request).then(function(reponseReseau){
        if(reponseReseau && reponseReseau.status === 200){
          const copie = reponseReseau.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, copie); });
        }
        return reponseReseau;
      }).catch(function(){
        return reponseEnCache;
      });
      return reponseEnCache || recuperationReseau;
    })
  );
});
