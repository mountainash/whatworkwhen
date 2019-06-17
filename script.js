// Call this file from footer

// Load in the tasks from a JSON file
$.get('schedule.json', function(data) {

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
			mtaskstart = moment().hour(splitstart[1]).minute(splitstart[3]),
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
			$('#tasks li:last').append('<span class="info">Starts ' + mtaskstart.fromNow() + '</span>');
		}

	});

	// Remove the first [placeholder] task
	$('#tasks li:first').remove();

}, 'json');

// Taken from momentjs.com homepage
function updateClock(){
    var now = moment(),
        second = now.seconds() * 6,
        minute = now.minutes() * 6 + second / 60,
        hour = ((now.hours() % 12) / 12) * 360 + 90 + minute / 12;

    $('#hour').css("transform", "rotate(" + hour + "deg)");
    $('#minute').css("transform", "rotate(" + minute + "deg)");
    $('#second').css("transform", "rotate(" + second + "deg)");
}

function timedUpdate() {
    updateClock();
    setTimeout(timedUpdate, 1000);
}

timedUpdate();