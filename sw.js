self.addEventListener('install', function(e) {
	e.waitUntil(
		caches.open('whatworkwhere').then(function(cache) {
			return cache.addAll([
				'/',
				'/?ref=webappmanifest',
				'/site.webmanifest',
				'/favicon.ico',
				'/index.html',
				'/style.css',
				'/script.min.js',
				'/cash.min.js',
				'/moment.min.js',
				'/schedule.json'
				]);
		})
	);
});

self.addEventListener('fetch', function(e) {
	e.respondWith(
		caches.match(e.request).then(function(response) {
			return response || fetch(e.request);
		})
	);
});