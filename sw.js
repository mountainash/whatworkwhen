self.addEventListener('install', function(e) {
	e.waitUntil(
		caches.open('airhorner').then(function(cache) {
			return cache.addAll([
				'/',
				'manifest.webapp',
				'/index.html',
				'/?utm_source=a2hs',
				'/index.html?utm_source=a2hs',
				'/style.css',
				'/script.min.js',
				'schedule.json',
				'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js',
				'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js'
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