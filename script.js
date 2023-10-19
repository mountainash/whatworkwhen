// out: script.min.js, compress: true

// Set to show a countdown in human seconds readable format
moment.relativeTimeThreshold('s', 60);
moment.relativeTimeThreshold('ss', 2);

var nexttask = {
	title: 'Day is over - go play! 🎉',
	start: moment(2400, 'hhmm'), // Moment timestamp for the start of the following task
};

// Load in the tasks from a JSON file
fetch('schedule.json', {priority: 'high'})
	.then((response) => {
		if (!response.ok) {
			throw new Error(`HTTP error, status = ${response.status}`);
		}
		return response.json();
	})
	.then((data) => {
		var dayend = data.day.end,
			classname = '';

		$.each(data.tasks, function(i, task) {
			// Validate json start time is 4 numerals
			if (! /\d{4}/.test(task.start) ) {
				console.error(`Task ${i} can only be 4 digits. "${task.start}" is not allowed`);
				return false;
			}
			// Validate it's a 24 hr time format
			if ( parseInt(task.start) < 0 || parseInt(task.start) > 2400 ) {
				console.error(`Task ${i} is not a valid 24 hour time. "${task.start}" is not allowed`);
				return false;
			}

			var taskstart = task.start,
				mtaskstart = moment(taskstart, 'hhmm'),
				taskend = dayend; // default to end of day

			if (data.tasks[i + 1]) {
				// displayed end time is the start of the next task (it's easier to [human] read a whole hour rather than `-1 minute`. eg 10:00 not 9:59
				taskend = data.tasks[i + 1].start;
			}

			if ( moment().isBetween(mtaskstart, moment(taskend, 'hhmm')) ) {
				classname = 'now';
			} else if (classname == 'now') {
				classname = 'soon';
			} else {
				classname = 'later'; // never used
			}

			// Output each task
			var $_placeholder = $('#tasks li:first-child').clone();

			$('.name', $_placeholder).text(task.title);
			$('.stime', $_placeholder).text(taskstart);
			$('.etime', $_placeholder).text(taskend);

			if (classname === 'soon') {
				nexttask = task;
				nexttask.start = mtaskstart; // set the start time to a "moment" time
				$_placeholder.append(`<span id="info">Starts in ${nexttask.start.fromNow(true)}</span>`);
			}

			$_placeholder
				.addClass(classname)
				.appendTo('#tasks ol');
		});

		$('#instructions,#tasks li:first-child').remove(); // seems to be working, remove the first [placeholder] task

		secUpdate();
	});

function updateClock() {
	// Taken from momentjs.com homepage
	var now = moment(),
		second = now.seconds() * 6,
		minute = now.minutes() * 6 + second / 60,
		hour = ((now.hours() % 12) / 12) * 360 + 90 + minute / 12;

		$('#clock-hour').css('transform', `rotate(${hour}deg)`);
		$('#clock-minute').css('transform', `rotate(${minute}deg)`);
		$('#clock-second').css('transform', `rotate(${second}deg)`);

		$('#digital-hour').text((`0${now.hours()}`).slice(-2));
		$('#digital-minute').text((`0${now.minutes()}`).slice(-2));
		$('#digital-second').text((`0${now.seconds()}`).slice(-2));

	if (now.seconds() == 0 || nexttask.start.diff(now) < 1 * 60 * 1000) { // on the minute start, and every call in the last minute of the task
		$('#info').text(`Starts in ${nexttask.start.toNow(true)}`);
	}

	if (now.isSameOrAfter(nexttask.start)) { // Check if the next task has started
		if ('Notification' in window) {
			var text = `Start ${nexttask.title}`,
				img = 'apple-touch-icon.png';

			try {
				new Notification('What Work When', {body: text, icon: img});
				window.navigator.vibrate(500);
			} catch (err) {
				alert(text);
			}
		}

		location.reload(); // Quick and nasty, but refreshes the schedule [when can be changed]...
	}
}

// Timers
function secUpdate() {
	updateClock();
	setTimeout(secUpdate, 1000);
}

// Notifications
function requestPermission() {
	if (!('Notification' in window)) {
		console.warn('Local Notifications not supported!');
	} else {
		Notification.requestPermission().then(function(permission) {
			console.info(`Local Notifications: ${permission}`);
		});
	}
	$('#activate-notifications').hide();
}

// If the url ends with ?ref=webappmanifest, show the install prompt
if (window.location.search === '?ref=webappmanifest' && ('Notification' in window) ) {
	$('#activate-notifications').show().on('click', function() {
			requestPermission();
			return false;
		});
}

requestPermission();