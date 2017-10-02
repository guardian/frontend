define([
    'lib/$',
    'lib/mediator',
    'bonzo'
], function (
    $,
    mediator,
    bonzo
) {

    function dayOfWeek(day) {
        return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
    }

    function monthAbbr(month) {
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month];
    }

    function pad(n) {
        return n < 10 ? '0' + n : n;
    }

    function isToday(date) {
        var today = new Date();
        return date && (date.toDateString() === today.toDateString());
    }

    function isWithin24Hours(date) {
        var today = new Date();
        return date && (date.valueOf() > today.valueOf() - (24 * 60 * 60 * 1000));
    }

    function isWithinSeconds(date, seconds) {
        var today = new Date();
        return date && (date.valueOf() > today.valueOf() - ((seconds || 0) * 1000));
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
        if (Object.prototype.toString.call(date) !== '[object Date]') {
            return false;
        }
        return !isNaN(date.getTime());
    }

    function getSuffix(type, format, value) {
        var strs,
            units = {
                s: {
                    'short': ['s'],
                    'med': ['s ago'],
                    'long':  [' second ago', ' seconds ago']
                },
                m: {
                    'short': ['m'],
                    'med': ['m ago'],
                    'long':  [' minute ago', ' minutes ago']
                },
                h: {
                    'short': ['h'],
                    'med': ['h ago'],
                    'long':  [' hour ago', ' hours ago']
                },
                d: {
                    'short': ['d'],
                    'med': ['d ago'],
                    'long':  [' day ago', ' days ago']
                }
            };
        if (units[type]) {
            strs = units[type][format];
            if (value === 1) {
                return strs[0];
            } else {
                return strs[strs.length - 1];
            }
        } else {
            return '';
        }
    }

    function makeRelativeDate(epoch, opts) {
        opts = opts || {};

        var minutes, hours, days, delta,
            then = new Date(Number(epoch)),
            now = new Date(),
            format = opts.format || 'short',
            extendedFormatting = (opts.format === 'short' || opts.format === 'med');

        if (!isValidDate(then)) {
            return false;
        }

        delta = parseInt((now.getTime() - then) / 1000, 10);

        if (delta < 0) {
            return false;

        } else if (opts.notAfter && delta > opts.notAfter) {
            return false;

        } else if (delta < 55) {
            return delta + getSuffix('s', format, delta);

        } else if (delta < (55 * 60)) {
            minutes = Math.round(delta / 60, 10);
            return minutes + getSuffix('m', format, minutes);

        } else if (isToday(then) || (extendedFormatting && isWithin24Hours(then))) {
            hours = Math.round(delta / 3600);
            return hours + getSuffix('h', format, hours);

        } else if (extendedFormatting && isWithinPastWeek(then)) {
            days = Math.round(delta / 3600 / 24);
            return days + getSuffix('d', format, days);

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
        return ' ' + date.getHours() + ':' + pad(date.getMinutes());
    }

    function findValidTimestamps() {
        // `.blocktime time` used in blog html
        return $('.js-timestamp, .js-item__timestamp');
    }

    function replaceLocaleTimestamps(html) {
        var cls = 'js-locale-timestamp';
        var context = html || document;

        $('.' + cls, context).each(function (el) {
            var datetime,
                $el = bonzo(el),
                timestamp = parseInt($el.attr('data-timestamp'), 10);

            if (timestamp) {
                datetime = new Date(timestamp);
                el.innerHTML = pad(datetime.getHours()) + ':' + pad(datetime.getMinutes());
                $el.removeClass(cls);
            }
        });
    }

    function replaceValidTimestamps(opts) {
        opts = opts || {};

        findValidTimestamps().each(function (el) {
            var targetEl,
                $el = bonzo(el),
                // Epoch dates are more reliable, fallback to datetime for liveblog blocks
                timestamp = parseInt($el.attr('data-timestamp'), 10) || $el.attr('datetime'),
                datetime = new Date(timestamp),
                relativeDate = makeRelativeDate(datetime.getTime(), {
                    // NOTE: if this is in a block (blog), assume we want added time on > 1 day old dates
                    showTime: bonzo($el.parent()).hasClass('block-time'),
                    format:   $el.attr('data-relativeformat'),
                    notAfter: opts.notAfter
                });

            if (relativeDate) {
                // If we find .timestamp__text (facia), use that instead
                targetEl = $el[0].querySelector('.timestamp__text') || $el[0];
                if (!targetEl.getAttribute('title')) {
                    targetEl.setAttribute('title', bonzo(targetEl).text());
                }
                targetEl.innerHTML = relativeDate;
            } else if (opts.notAfter) {
                $el.addClass('modern-hidden');
            }
        });
    }

    // DEPRECATED: Bindings
    ['related', 'autoupdate'].forEach(function (module) {
        mediator.on('modules:' + module + ':render', replaceValidTimestamps);
    });

    function init(opts) {
        replaceValidTimestamps(opts);
        replaceLocaleTimestamps();
    }

    return {
        replaceLocaleTimestamps: replaceLocaleTimestamps,
        makeRelativeDate: makeRelativeDate,
        isWithinSeconds: isWithinSeconds,
        init: init
    };

});
