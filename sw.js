self.addEventListener('install', function(e) {
	e.waitUntil(
		caches.open('whatworkwhere').then(function(cache) {
			return cache.addAll([
				'/',
				'/manifest.webapp',
				'/favicon.ico',
				'/index.html',
				'/',
				'/index.html',
				'/style.css',
				'/cash.min.js',
				'/moment.min.js',
				'/script.min.js',
				'/schedule.json'
				]);
		})
	);
});

self.addEventListener('fetch', function(event) {
	event.respondWith(
		caches.match(event.request).then(function(response) {
			return response || fetch(event.request);
		})
	);
});