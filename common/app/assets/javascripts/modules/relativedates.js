define(['common'], function (common) {

	var $g = common.$;

    // date helpers

    function dayOfWeek(day) {
        return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
    }
    
    function monthAbbr(month) {
       return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month];
    }
	
    function pad(n){ return n < 10 ? '0' + n : n }
    
    function ampm(n){ return n < 12 ? 'am' : 'pm' }

    function twelveHourClock(hours) { return  hours > 12 ? hours -12 : hours; }

    function isToday(date) {
        var today = new Date();
        return (date.toDateString() == today.toDateString());
    }

    function isYesterday(date) {
        var yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        return (date.toDateString() == yesterday.toDateString());
    }
 
    function makeRelativeDate (timeValue) {

		var then = Date(timeValue);
		var parsedDate = Date.parse(timeValue);
		var relativeTo = new Date();

		// check our dates are valid
		if (!parsedDate) {
			return false;
		}

		var delta = parseInt((relativeTo.getTime() - parsedDate) / 1000);
		
        if (delta < 0) {
			return timeValue;
		} else if (delta < 55) {
			return 'less than a minute ago';
		} else if (delta < 90) {
			return 'about a minute ago';
		} else if (delta < (8*60)) {
			return 'about ' + (parseInt(delta / 60)).toString() + ' minutes ago';
		} else if (delta < (55*60)) {
			return (parseInt(delta / 60)).toString() + ' minutes ago';
		} else if (delta < (90*60)) { 
			return 'about an hour ago';
		} else if (delta < (5*60*60)) { 
			return 'about ' + (parseInt(delta / 3600)).toString() + ' hours ago';
		} else if (isToday(then)) { 
			return 'Today, ' + twelveHourClock(then.getHours()) + ':' + pad(then.getMinutes()) + ampm(then.getHours());
		} else if (isYesterday(then)) { // yesterday 
			return 'Yesterday, ' + twelveHourClock(then.getHours()) + ':' + pad(then.getMinutes()) + ampm(then.getHours())
		} else if (delta < 5*24*60*60) { // less than 5 days 
            return dayOfWeek(then.getDay()) + ' ' + then.getDate() + ' ' + monthAbbr(then.getMonth()) + ' ' + then.getFullYear(); 
		} else {
            return then.getDate() + ' ' + monthAbbr(then.getMonth()) + ' ' + then.getFullYear(); 
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
		        var relativeDate = makeRelativeDate(timestamp);
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
		makeRelativeDate: makeRelativeDate,
		init: init
	}

});
