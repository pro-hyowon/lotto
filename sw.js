// LOTTO LAB 서비스워커: 앱 설치 + 오프라인 실행
const CACHE='lotto-lab-v2';
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  // 앱 화면: 인터넷 되면 최신 버전, 안 되면 저장본
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put('./index.html',c));return res;})
      .catch(()=>caches.match('./index.html')));
    return;
  }
  // 아이콘·폰트·인식 라이브러리: 저장본 우선, 없으면 받아서 저장
  if(url.origin===location.origin||/fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net/.test(url.host)){
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
      if(res&&(res.ok||res.type==='opaque')){const c=res.clone();caches.open(CACHE).then(x=>x.put(req,c));}
      return res;
    })));
  }
});
