define(['common', 'bonzo'], function (common, bonzo) {

    function dayOfWeek(day) {
        return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
    }
    
    function monthAbbr(month) {
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month];
    }
    
    function pad(n) {
        return n < 10 ? '0' + n : n;
    }
    
    function ampm(n) {
        return n < 12 ? 'am' : 'pm';
    }

    function twelveHourClock(hours) {
        return  hours > 12 ? hours - 12 : hours;
    }

    function isToday(date) {
        var today = new Date();
        return (date.toDateString() === today.toDateString());
    }

    function isWithin24Hours(date) {
        var today = new Date();
        return (date.valueOf() > today.valueOf() - (24 * 60 * 60 * 1000));
    }

    function isYesterday(relative) {
        var today = new Date(),
            yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        return (relative.toDateString() === yesterday.toDateString());
    }

    function isWithinPastWeek(date) {
        var weekAgo = new Date().valueOf() - (7 * 24 * 60 * 60 * 1000);
        return date.valueOf() >= weekAgo;
    }

    function isValidDate(date) {
        if (Object.prototype.toString.call(date) !== "[object Date]") {
            return false;
        }
        return !isNaN(date.getTime());
    }

    function makeRelativeDate(epoch, opts) {
        var then = new Date(Number(epoch)),
            now = new Date(),
            delta;

        opts = opts || {};

        if (!isValidDate(then)) {
            return false;
        }

        delta = parseInt((now.getTime() - then) / 1000, 10);

        if (delta < 0) {
            return false;

        } else if (delta < 55) {
            return delta + 's';

        } else if (delta < (55 * 60)) {
            return (Math.round(delta / 60, 10)) + 'm';

        } else if (isToday(then) || (isWithin24Hours(then) && opts.format === 'short')) {
            return (Math.round(delta / 3600)) + 'h';

        } else if (isWithinPastWeek(then) && opts.format === 'short') {
            return (Math.round(delta / 3600 / 24)) + 'd';

        } else if (isYesterday(then)) { // yesterday
            return 'Yesterday' + withTime(then);

        } else if (delta < 5 * 24 * 60 * 60) { // less than 5 days
            return [dayOfWeek(then.getDay()), then.getDate(), monthAbbr(then.getMonth()), then.getFullYear()].join(' ') +
                   (opts.showTime ? withTime(then) : '');

        } else {
            return [then.getDate(), monthAbbr(then.getMonth()), then.getFullYear()].join(' ') +
                   (opts.showTime ? withTime(then) : '');

        }
    }
    
    function withTime(date) {
        return ', ' + twelveHourClock(date.getHours()) + ':' + pad(date.getMinutes()) + ampm(date.getHours());
    }

    function findValidTimestamps(context) {
        // `.blocktime time` used in blog html
        return common.$g('.js-timestamp, .block-time time, .js-item__timestamp', context);
    }

    function replaceValidTimestamps(context) {
        findValidTimestamps(context).each(function(el, i) {
            var $el = bonzo(el),
                timestamp = parseInt($el.attr('data-timestamp'), 10) || $el.attr('datetime'), // Epoch dates are more reliable, fallback to datetime for liveblog blocks
                datetime = new Date(timestamp),
                relativeDate = makeRelativeDate(datetime.getTime(), {
                                  // NOTE: if this is in a block (blog), assume we want added time on > 1 day old dates
                                  showTime: bonzo($el.parent()).hasClass('block-time'),
                                  format:   $el.attr('data-relativeformat')
                               });

            $el.removeClass('js-timestamp');

            if (relativeDate) {
                // If we find .timestamp__text (facia), use that instead
                var targetEl = $el[0].querySelector('.timestamp__text') || $el[0];

                targetEl.setAttribute('title', bonzo(targetEl).text());
                targetEl.innerHTML = relativeDate;
            }
        });
    }

     // DEPRECATED: Bindings
    ['related', 'autoupdate'].forEach(function(module) {
        common.mediator.on('modules:' + module + ':render', replaceValidTimestamps);
    });
   
    function init(context) {
        replaceValidTimestamps(context);
    }

    return {
        makeRelativeDate: makeRelativeDate,
        init: init
    };

});
