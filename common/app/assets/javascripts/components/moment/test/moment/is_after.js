var moment = require("../../moment");

exports.is_after = {
    "is after without units" : function(test) {
        test.expect(17);

        var m = moment(new Date(2011, 3, 2, 3, 4, 5, 10)), mCopy = moment(m);
    test.equal(m.isAfter(moment(new Date(2012, 3, 2, 3, 5, 5, 10))), false, "year is later");
    test.equal(m.isAfter(moment(new Date(2010, 3, 2, 3, 3, 5, 10))), true, "year is earlier");
    test.equal(m.isAfter(moment(new Date(2011, 4, 2, 3, 4, 5, 10))), false, "month is later");
    test.equal(m.isAfter(moment(new Date(2011, 2, 2, 3, 4, 5, 10))), true, "month is earlier");
    test.equal(m.isAfter(moment(new Date(2011, 3, 3, 3, 4, 5, 10))), false, "day is later");
    test.equal(m.isAfter(moment(new Date(2011, 3, 1, 3, 4, 5, 10))), true, "day is earlier");
    test.equal(m.isAfter(moment(new Date(2011, 3, 2, 4, 4, 5, 10))), false, "hour is later");
    test.equal(m.isAfter(moment(new Date(2011, 3, 2, 2, 4, 5, 10))), true, "hour is earlier");
    test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 5, 5, 10))), false, "minute is later");
    test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 3, 5, 10))), true, "minute is earlier");
    test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 4, 6, 10))), false, "second is later");
    test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 4, 4, 11))), true, "second is earlier");
    test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 4, 5, 10))), false, "millisecond match");
    test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 4, 5, 11))), false, "millisecond is later");
    test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 4, 5, 9))), true, "millisecond is earlier");
        test.equal(m.isAfter(m), false, "moments are not after themselves");
        test.equal(+m, +mCopy, "isAfter second should not change moment");
        test.done();
    },

    "is after year" : function(test) {
        test.expect(11);

        var m = moment(new Date(2011, 1, 2, 3, 4, 5, 6)), mCopy = moment(m);
        test.equal(m.isAfter(moment(new Date(2011, 5, 6, 7, 8, 9, 10)), 'year'), false, "year match");
        test.equal(m.isAfter(moment(new Date(2010, 5, 6, 7, 8, 9, 10)), 'years'), true, "plural should work");
        test.equal(m.isAfter(moment(new Date(2013, 5, 6, 7, 8, 9, 10)), 'year'), false, "year is later");
        test.equal(m.isAfter(moment(new Date(2010, 5, 6, 7, 8, 9, 10)), 'year'), true, "year is earlier");
        test.equal(m.isAfter(moment(new Date(2011, 0, 1, 0, 0, 0, 0)), 'year'), false, "exact start of year");
        test.equal(m.isAfter(moment(new Date(2011, 11, 31, 23, 59, 59, 999)), 'year'), false, "exact end of year");
        test.equal(m.isAfter(moment(new Date(2012, 0, 1, 0, 0, 0, 0)), 'year'), false, "start of next year");
        test.equal(m.isAfter(moment(new Date(2010, 11, 31, 23, 59, 59, 999)), 'year'), true, "end of previous year");
        test.equal(m.isAfter(moment(new Date(1980, 11, 31, 23, 59, 59, 999)), 'year'), true, "end of year far before");
        test.equal(m.isAfter(m, 'year'), false, "same moments are not after the same year");
        test.equal(+m, +mCopy, "isAfter year should not change moment");
        test.done();
    },

    "is after month" : function(test) {
        test.expect(13);

        var m = moment(new Date(2011, 2, 3, 4, 5, 6, 7)), mCopy = moment(m);
        test.equal(m.isAfter(moment(new Date(2011, 2, 6, 7, 8, 9, 10)), 'month'), false, "month match");
        test.equal(m.isAfter(moment(new Date(2010, 2, 6, 7, 8, 9, 10)), 'months'), true, "plural should work");
        test.equal(m.isAfter(moment(new Date(2012, 2, 6, 7, 8, 9, 10)), 'month'), false, "year is later");
        test.equal(m.isAfter(moment(new Date(2010, 2, 6, 7, 8, 9, 10)), 'month'), true, "year is earlier");
        test.equal(m.isAfter(moment(new Date(2011, 5, 6, 7, 8, 9, 10)), 'month'), false, "month is later");
        test.equal(m.isAfter(moment(new Date(2011, 1, 6, 7, 8, 9, 10)), 'month'), true, "month is earlier");
        test.equal(m.isAfter(moment(new Date(2011, 2, 1, 0, 0, 0, 0)), 'month'), false, "exact start of month");
        test.equal(m.isAfter(moment(new Date(2011, 2, 31, 23, 59, 59, 999)), 'month'), false, "exact end of month");
        test.equal(m.isAfter(moment(new Date(2011, 3, 1, 0, 0, 0, 0)), 'month'), false, "start of next month");
        test.equal(m.isAfter(moment(new Date(2011, 1, 27, 23, 59, 59, 999)), 'month'), true, "end of previous month");
        test.equal(m.isAfter(moment(new Date(2010, 12, 31, 23, 59, 59, 999)), 'month'), true, "later month but earlier year");
        test.equal(m.isAfter(m, 'month'), false, "same moments are not after the same month");
        test.equal(+m, +mCopy, "isAfter month should not change moment");
        test.done();
    },

    "is after day" : function(test) {
        test.expect(15);

        var m = moment(new Date(2011, 3, 2, 3, 4, 5, 6)), mCopy = moment(m);
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 7, 8, 9, 10)), 'day'), false, "day match");
        test.equal(m.isAfter(moment(new Date(2010, 3, 2, 7, 8, 9, 10)), 'days'), true, "plural should work");
        test.equal(m.isAfter(moment(new Date(2012, 3, 2, 7, 8, 9, 10)), 'day'), false, "year is later");
        test.equal(m.isAfter(moment(new Date(2010, 3, 2, 7, 8, 9, 10)), 'day'), true, "year is earlier");
        test.equal(m.isAfter(moment(new Date(2011, 4, 2, 7, 8, 9, 10)), 'day'), false, "month is later");
        test.equal(m.isAfter(moment(new Date(2011, 2, 2, 7, 8, 9, 10)), 'day'), true, "month is earlier");
        test.equal(m.isAfter(moment(new Date(2011, 3, 3, 7, 8, 9, 10)), 'day'), false, "day is later");
        test.equal(m.isAfter(moment(new Date(2011, 3, 1, 7, 8, 9, 10)), 'day'), true, "day is earlier");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 0, 0, 0, 0)), 'day'), false, "exact start of day");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 23, 59, 59, 999)), 'day'), false, "exact end of day");
        test.equal(m.isAfter(moment(new Date(2011, 3, 3, 0, 0, 0, 0)), 'day'), false, "start of next day");
        test.equal(m.isAfter(moment(new Date(2011, 3, 1, 23, 59, 59, 999)), 'day'), true, "end of previous day");
        test.equal(m.isAfter(moment(new Date(2010, 3, 10, 0, 0, 0, 0)), 'day'), true, "later day but earlier year");
        test.equal(m.isAfter(m, 'day'), false, "same moments are not after the same day");
        test.equal(+m, +mCopy, "isAfter day should not change moment");
        test.done();
    },

    "is after hour" : function(test) {
        test.expect(16);

        var m = moment(new Date(2011, 3, 2, 3, 4, 5, 6)), mCopy = moment(m);
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 8, 9, 10)), 'hour'), false, "hour match");
        test.equal(m.isAfter(moment(new Date(2010, 3, 2, 3, 8, 9, 10)), 'hours'), true, "plural should work");
        test.equal(m.isAfter(moment(new Date(2012, 3, 2, 3, 8, 9, 10)), 'hour'), false, "year is later");
        test.equal(m.isAfter(moment(new Date(2010, 3, 2, 3, 8, 9, 10)), 'hour'), true, "year is earlier");
        test.equal(m.isAfter(moment(new Date(2011, 4, 2, 3, 8, 9, 10)), 'hour'), false, "month is later");
        test.equal(m.isAfter(moment(new Date(2011, 1, 2, 3, 8, 9, 10)), 'hour'), true, "month is earlier");
        test.equal(m.isAfter(moment(new Date(2011, 3, 3, 3, 8, 9, 10)), 'hour'), false, "day is later");
        test.equal(m.isAfter(moment(new Date(2011, 3, 1, 3, 8, 9, 10)), 'hour'), true, "day is earlier");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 4, 8, 9, 10)), 'hour'), false, "hour is later");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 8, 9, 10)), 'hour'), false, "hour is earlier");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 0, 0, 0)), 'hour'), false, "exact start of hour");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 59, 59, 999)), 'hour'), false, "exact end of hour");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 4, 0, 0, 0)), 'hour'), false, "start of next hour");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 2, 59, 59, 999)), 'hour'), true, "end of previous hour");
        test.equal(m.isAfter(m, 'hour'), false, "same moments are not after the same hour");
        test.equal(+m, +mCopy, "isAfter hour should not change moment");
        test.done();
    },

    "is after minute" : function(test) {
        test.expect(18);

        var m = moment(new Date(2011, 3, 2, 3, 4, 5, 6)), mCopy = moment(m);
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 4, 9, 10)), 'minute'), false, "minute match");
        test.equal(m.isAfter(moment(new Date(2010, 3, 2, 3, 4, 9, 10)), 'minutes'), true, "plural should work");
        test.equal(m.isAfter(moment(new Date(2012, 3, 2, 3, 4, 9, 10)), 'minute'), false, "year is later");
        test.equal(m.isAfter(moment(new Date(2010, 3, 2, 3, 4, 9, 10)), 'minute'), true, "year is earlier");
        test.equal(m.isAfter(moment(new Date(2011, 4, 2, 3, 4, 9, 10)), 'minute'), false, "month is later");
        test.equal(m.isAfter(moment(new Date(2011, 2, 2, 3, 4, 9, 10)), 'minute'), true, "month is earlier");
        test.equal(m.isAfter(moment(new Date(2011, 3, 3, 3, 4, 9, 10)), 'minute'), false, "day is later");
        test.equal(m.isAfter(moment(new Date(2011, 3, 1, 3, 4, 9, 10)), 'minute'), true, "day is earlier");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 4, 4, 9, 10)), 'minute'), false, "hour is later");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 2, 4, 9, 10)), 'minute'), true, "hour is earler");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 5, 9, 10)), 'minute'), false, "minute is later");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 3, 9, 10)), 'minute'), true, "minute is earlier");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 4, 0, 0)), 'minute'), false, "exact start of minute");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 4, 59, 999)), 'minute'), false, "exact end of minute");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 5, 0, 0)), 'minute'), false, "start of next minute");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 3, 59, 999)), 'minute'), true, "end of previous minute");
        test.equal(m.isAfter(m, 'minute'), false, "same moments are not after the same minute");
        test.equal(+m, +mCopy, "isAfter minute should not change moment");
        test.done();
    },

    "is after second" : function(test) {
        test.expect(20);

        var m = moment(new Date(2011, 3, 2, 3, 4, 5, 10)), mCopy = moment(m);
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 4, 5, 10)), 'second'), false, "second match");
        test.equal(m.isAfter(moment(new Date(2010, 3, 2, 3, 4, 5, 10)), 'seconds'), true, "plural should work");
        test.equal(m.isAfter(moment(new Date(2012, 3, 2, 3, 4, 5, 10)), 'second'), false, "year is later");
        test.equal(m.isAfter(moment(new Date(2010, 3, 2, 3, 4, 5, 10)), 'second'), true, "year is earlier");
        test.equal(m.isAfter(moment(new Date(2011, 4, 2, 3, 4, 5, 10)), 'second'), false, "month is later");
        test.equal(m.isAfter(moment(new Date(2011, 2, 2, 3, 4, 5, 10)), 'second'), true, "month is earlier");
        test.equal(m.isAfter(moment(new Date(2011, 3, 3, 3, 4, 5, 10)), 'second'), false, "day is later");
        test.equal(m.isAfter(moment(new Date(2011, 3, 1, 1, 4, 5, 10)), 'second'), true, "day is earlier");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 4, 4, 5, 10)), 'second'), false, "hour is later");
        test.equal(m.isAfter(moment(new Date(2011, 3, 1, 4, 1, 5, 10)), 'second'), true, "hour is earlier");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 5, 5, 10)), 'second'), false, "minute is later");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 3, 5, 10)), 'second'), true, "minute is earlier");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 4, 6, 10)), 'second'), false, "second is later");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 4, 4, 5)), 'second'), true, "second is earlier");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 4, 5, 0)), 'second'), false, "exact start of second");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 4, 5, 999)), 'second'), false, "exact end of second");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 4, 6, 0)), 'second'), false, "start of next second");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 4, 4, 999)), 'second'), true, "end of previous second");
        test.equal(m.isAfter(m, 'second'), false, "same moments are not after the same second");
        test.equal(+m, +mCopy, "isAfter second should not change moment");
        test.done();
    },

    "is after millisecond" : function(test) {
        test.expect(18);

        var m = moment(new Date(2011, 3, 2, 3, 4, 5, 10)), mCopy = moment(m);
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 4, 5, 10)), 'millisecond'), false, "millisecond match");
        test.equal(m.isAfter(moment(new Date(2010, 3, 2, 3, 4, 5, 10)), 'milliseconds'), true, "plural should work");
        test.equal(m.isAfter(moment(new Date(2012, 3, 2, 3, 4, 5, 10)), 'millisecond'), false, "year is later");
        test.equal(m.isAfter(moment(new Date(2010, 3, 2, 3, 4, 5, 10)), 'millisecond'), true, "year is earlier");
        test.equal(m.isAfter(moment(new Date(2011, 4, 2, 3, 4, 5, 10)), 'millisecond'), false, "month is later");
        test.equal(m.isAfter(moment(new Date(2011, 2, 2, 3, 4, 5, 10)), 'millisecond'), true, "month is earlier");
        test.equal(m.isAfter(moment(new Date(2011, 3, 3, 3, 4, 5, 10)), 'millisecond'), false, "day is later");
        test.equal(m.isAfter(moment(new Date(2011, 3, 1, 1, 4, 5, 10)), 'millisecond'), true, "day is earlier");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 4, 4, 5, 10)), 'millisecond'), false, "hour is later");
        test.equal(m.isAfter(moment(new Date(2011, 3, 1, 4, 1, 5, 10)), 'millisecond'), true, "hour is earlier");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 5, 5, 10)), 'millisecond'), false, "minute is later");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 3, 5, 10)), 'millisecond'), true, "minute is earlier");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 4, 6, 10)), 'millisecond'), false, "second is later");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 4, 4, 5)), 'millisecond'), true, "second is earlier");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 4, 6, 11)), 'millisecond'), false, "millisecond is later");
        test.equal(m.isAfter(moment(new Date(2011, 3, 2, 3, 4, 4, 9)), 'millisecond'), true, "millisecond is earlier");
        test.equal(m.isAfter(m, 'millisecond'), false, "same moments are not after the same millisecond");
        test.equal(+m, +mCopy, "isAfter millisecond should not change moment");
        test.done();
    }

};
