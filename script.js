// Call this file from footer

var nexttask; // Moment timestamp for the start of the following task

// Load in the tasks from a JSON file
$.getJSON('schedule.json', function(data) {

	var dayend = data.day.end,
		classname = '';

	$.each(data.tasks, function(i, task) {

		// Validate json start time is 4 numerals
		if (! /\d{4}/.test(task.start) ) {
			console.error('Task ' + i + ' can only be 4 digits. "' + task.start +'" is not allowed');
			return false;
		}
		// Validate it's a 24 hr time format
		if ( parseInt(task.start) < 0 || parseInt(task.start) > 2400 ) {
			console.error('Task ' + i + ' is not a valid 24 hour time. "' + task.start +'" is not allowed');
			return false;
		}

		$('#instructions').remove(); // seems to be working

		var taskstart = task.start,
			splitstart = taskstart.split(/(\d{2})/),
			mtaskstart = moment().hour(splitstart[1]).minute(splitstart[3]).second(0),
			taskend = dayend;

		if (data.tasks[i+1]) {
			// displayed end time is the start of the next task (it's easier to [human] read a whole hour rather than `-1 minute`. eg 10:00 not 9:59
			taskend = data.tasks[i+1].start;
		}

		var	splitend = taskend.split(/(\d{2})/),
			mtaskend = moment().hour(splitend[1]).minute(splitend[3]);

		if ( moment().isBetween(mtaskstart, mtaskend) ) {
			classname = 'now';
		} else if (classname == 'now') {
			classname = 'soon';
		} else {
			classname = '';
		}

		// Output each task
		$('#tasks li:first')
			.clone()
			.find('.name')
			.text(task.title)
			.end()
			.find('.stime')
			.text(taskstart)
			.end()
			.find('.etime')
			.text(taskend)
			.end()
			.addClass(classname)
			.appendTo('#tasks ol');

		if (classname == 'soon') {
			nexttask = mtaskstart;
			$('#tasks li:last').append('<span id="info">Starts in ' + nexttask.fromNow(true) + '</span>');
		}

	});

	// Remove the first [placeholder] task
	$('#tasks li:first').remove();

}).done(function() {

	// Init
	secUpdate();

});

function updateClock() {
	// Taken from momentjs.com homepage
    var now = moment(),
        second = now.seconds() * 6,
        minute = now.minutes() * 6 + second / 60,
        hour = ((now.hours() % 12) / 12) * 360 + 90 + minute / 12;

    $('#hour').css('transform', 'rotate(' + hour + 'deg)');
    $('#minute').css('transform', 'rotate(' + minute + 'deg)');
    $('#second').css('transform', 'rotate(' + second + 'deg)');

	if (typeof nexttask =='undefined') return; // sometimes the JSON hasn't finished being parsed

    if (now.seconds() == 0 || nexttask - now < 1 * 60 * 1000) { // on the minute start, and every call in the last minute
	    minUpdate();
    }

    if (now >= nexttask) { // Check if the next task has started
        location.reload(); // Quick and nasty...
    }
}

function minUpdate() {
	$('#info').text('Starts in ' + nexttask.fromNow(true));
}

// Timers
function secUpdate() {
    updateClock();
    setTimeout(secUpdate, 1000);
}