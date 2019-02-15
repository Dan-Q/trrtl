//This is the service worker with the Cache-first network

var CACHE = 'trrtl-precache-v0.7';
var precacheFiles = [
  '/manifest.json',
  '/',
  '/css/trrtl.css',
  '/css/trrtl-help.css',
  '/help/',
  '/img/code.svg',
  '/img/help.svg',
  '/img/play.svg',
  '/img/reset.svg',
  '/js/coffeescript.min.js',
  '/js/jszip.min.js',
  '/js/trrtl.js',
  '/samples/rbcircle.logo',
  '/samples/snail.logo',
  '/samples/spiral-star.logo'
];

//Install stage sets up the cache-array to configure pre-cache content
self.addEventListener('install', function(evt) {
  evt.waitUntil(precache().then(function() {
    return self.skipWaiting();
  }));
});


//allow sw to control of current page
self.addEventListener('activate', function(event) {
  return self.clients.claim();
});

self.addEventListener('fetch', function(evt) {
  evt.respondWith(fromCache(evt.request).catch(fromServer(evt.request)));
  evt.waitUntil(update(evt.request));
});


function precache() {
  return caches.open(CACHE).then(function (cache) {
    return cache.addAll(precacheFiles);
  });
}

function fromCache(request) {
  //we pull files from the cache first thing so we can show them fast
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      return matching || Promise.reject('no-match');
    });
  });
}

function update(request) {
  //this is where we call the server to get the newest version of the 
  //file to use the next time we show view
  return caches.open(CACHE).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response);
    });
  });
}

function fromServer(request){
  //this is the fallback if it is not in the cache to go to the server and get it
  return fetch(request).then(function(response){ return response});
}
