define(['common'], function (common) {

	var $g = common.$;

	// takes optional 2nd argument for custom 'now' value.
	// both arguments should be strings, eg. '2012-08-13 12:00:00'
	// but also work with "standard" (lolz) javascript Date() objects too.
	// API renders timestamps as 2012-04-13T18:43:36.000+01:00, which also work.

	function getRelativeDate (time_value) {

		var parsed_date = Date.parse(time_value);
		var relative_to = new Date();

		// check our dates are valid
		if (!parsed_date) {
			return false;
		}

		var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);

		if (delta < 0) {
			return time_value;
		} else if (delta < 10) { // less than 10 seconds
			return 'just now';
		} else if (delta < 60) { // less than 1 min
			return 'less than a minute ago';
		} else if (delta < 120) { // less than 2 mins
			return 'about a minute ago';
		} else if (delta < (45*60)) { // less than 45 mins
			return (parseInt(delta / 60)).toString() + ' minutes ago';
		} else if (delta < (90*60)) { // less than 1:30
			return 'about an hour ago';
		} else if (delta < (24*60*60)) { // less than 24 hrs ago
			return (parseInt(delta / 3600)).toString() + ' hours ago';
		} else if (delta < (48*60*60)) { // less than 48 hours ago
			return 'about a day ago';
		} else if (delta < 30*24*60*60) { // less than 30 days ago
			return (parseInt(delta / 86400)).toString() + ' days ago';
		} else if (delta < 60*24*60*60) { // less than 60 days ago
			return 'about a month ago';
		} else if (delta < 365*24*60*60) { // less than 1 year ago
			return 'about ' + (parseInt(delta / 2628000)).toString() + ' months ago';
		} else if (delta < 2*365*24*60*60) { // less than 2 years ago
			return 'about a year ago';
		} else {
			return 'about ' + (parseInt(delta / 31557600)).toString() + ' years ago';
		}
	}

	function findValidTimestamps () {
		var elms = document.querySelectorAll('.js-timestamp');
		return elms;
	}

	function replaceValidTimestamps () {
		var elms = findValidTimestamps();
		if (elms.length > 0) {
			for (var i=0, l=elms.length; i<l; i++) {
				var e = elms[i];
				$g(e).removeClass('js-timestamp'); // don't check this again
				var timestamp = e.getAttribute('data-timestamp');
		        var relativeDate = getRelativeDate(timestamp);
				var prettyDate = e.innerText || e.textContent; // fix for old FF
				if (relativeDate) {
					e.innerHTML = '<span title="' + prettyDate + '">' + relativeDate + '</span>';
				}
			}
		}
	}

	// bind to pubsub
	common.mediator.on('modules:relativedates:relativise', replaceValidTimestamps);
	common.mediator.on('modules:popular:render', replaceValidTimestamps);


	function init () {
		common.mediator.emit('modules:relativedates:relativise');
	}

	return {
		makeRelativeDate: getRelativeDate,
		init: init
	}

});
