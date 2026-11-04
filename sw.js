const C='ba-v31',F=['icon-head.png','icon-bar.png','./','index.html','manifest.json','icon.svg','avatar/1.jpg','avatar/2.jpg','avatar/3.jpg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(F))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))));
self.addEventListener('fetch',e=>e.respondWith(fetch(e.request).catch(()=>caches.match(e.request))));
