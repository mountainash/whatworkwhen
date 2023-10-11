// out: script.min.js, compress: true

// Call this file from footer

var nexttask; // Moment timestamp for the start of the following task

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

			$('#instructions').remove(); // seems to be working

			var taskstart = task.start,
				splitstart = taskstart.split(/(\d{2})/), // break the task start time into hours and minutes
				mtaskstart = moment().hour(splitstart[1]).minute(splitstart[3]).second(0),
				taskend = dayend, // default to end of day
				classname = '';

			if (data.tasks[i + 1]) {
				// displayed end time is the start of the next task (it's easier to [human] read a whole hour rather than `-1 minute`. eg 10:00 not 9:59
				taskend = data.tasks[i + 1].start;
			}

			var	splitend = taskend.split(/(\d{2})/),
				mtaskend = moment().hour(splitend[1]).minute(splitend[3]);

			if ( moment().isBetween(mtaskstart, mtaskend) ) {
				classname = 'now';
			} else if (classname == 'now') {
				classname = 'soon';
			}

			// Output each task
			var $_placeholder = $('#tasks li').first().clone();

			$_placeholder
				.find('.name')
				.text(task.title)

			$_placeholder
				.find('.stime')
				.text(taskstart)

			$_placeholder
				.find('.etime')
				.text(taskend)

			$_placeholder
				.addClass(classname)
				.appendTo('#tasks ol');

			if (classname === 'soon') {
				nexttask = task;
				nexttask.start = mtaskstart; // set the start time to a "moment" time
				$('#tasks li').last().append(`<span id="info">Starts in ${nexttask.start.fromNow(true)}</span>`);
			}

		});

		// Remove the first [placeholder] task
		$('#tasks li').first().remove();

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

	if (now.seconds() == 0 || nexttask.start - now < 1 * 60 * 1000) { // on the minute start, and every call in the last minute
		minUpdate();
	}

	if (now >= nexttask.start) { // Check if the next task has started

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

		location.reload(); // Quick and nasty...
	}
}

function minUpdate() {
	$('#info').text(`Starts in ${nexttask.start.fromNow(true)}`);
}

// Timers
function secUpdate() {
	updateClock();
	setTimeout(secUpdate, 1000);
}

function requestPermission() {
	if (!('Notification' in window)) {
		console.warn('Local Notifications not supported!');
	} else {
		Notification.requestPermission().then(function(permission) {
			console.info(`Local Notifications: ${permission}`);
		});
	}
}

requestPermission();