var moment = require("../../moment");

exports.format = {
    "format YY" : function(test) {
        test.expect(1);

        var b = moment(new Date(2009, 1, 14, 15, 25, 50, 125));
        test.equal(b.format('YY'), '09', 'YY ---> 09');
        test.done();
    },

    "format escape brackets" : function(test) {
        test.expect(9);

        moment.lang('en');

        var b = moment(new Date(2009, 1, 14, 15, 25, 50, 125));
        test.equal(b.format('[day]'), 'day', 'Single bracket');
        test.equal(b.format('[day] YY [YY]'), 'day 09 YY', 'Double bracket');
        test.equal(b.format('[YY'), '[09', 'Un-ended bracket');
        test.equal(b.format('[[YY]]'), '[YY]', 'Double nested brackets');
        test.equal(b.format('[[]'), '[', 'Escape open bracket');
        test.equal(b.format('[Last]'), 'Last', 'localized tokens');
        test.equal(b.format('[L] L'), 'L 02/14/2009', 'localized tokens with escaped localized tokens');
        test.equal(b.format('[L LL LLL LLLL aLa]'), 'L LL LLL LLLL aLa', 'localized tokens with escaped localized tokens');
        test.equal(b.format('[LLL] LLL'), 'LLL February 14 2009 3:25 PM', 'localized tokens with escaped localized tokens (recursion)');
        test.done();
    },

    "format milliseconds" : function(test) {
        test.expect(6);
        var b = moment(new Date(2009, 1, 14, 15, 25, 50, 123));
        test.equal(b.format('S'), '1', 'Deciseconds');
        test.equal(b.format('SS'), '12', 'Centiseconds');
        test.equal(b.format('SSS'), '123', 'Milliseconds');
        b.milliseconds(789);
        test.equal(b.format('S'), '7', 'Deciseconds');
        test.equal(b.format('SS'), '78', 'Centiseconds');
        test.equal(b.format('SSS'), '789', 'Milliseconds');
        test.done();
    },

    "format timezone" : function(test) {
        test.expect(2);

        var b = moment(new Date(2010, 1, 14, 15, 25, 50, 125));
        var explanation = 'moment().format("z") = ' + b.format('z') + ' It should be something like "PST"'
        if (moment().zone() === -60) {
            explanation += "For UTC+1 this is a known issue, see https://github.com/timrwood/moment/issues/162";
        }
        test.ok(b.format('Z').match(/^[\+\-]\d\d:\d\d$/), b.format('Z') + ' should be something like "+07:30"');
        test.ok(b.format('ZZ').match(/^[\+\-]\d{4}$/), b.format('ZZ') + ' should be something like "+0700"');
        test.done();
    },

    "format multiple with zone" : function(test) {
        test.expect(1);

        var b = moment('2012-10-08 -1200', ['YYYY ZZ', 'YYYY-MM-DD ZZ']);
        test.equals(b.format('YYYY-MM'), '2012-10', 'Parsing multiple formats should not crash with different sized formats');
        test.done();
    },

    "isDST" : function(test) {
        test.expect(2);

        var janOffset = new Date(2011, 0, 1).getTimezoneOffset(),
            julOffset = new Date(2011, 6, 1).getTimezoneOffset(),
            janIsDst = janOffset < julOffset,
            julIsDst = julOffset < janOffset,
            jan1 = moment([2011]),
            jul1 = moment([2011, 6]);

        if (janIsDst && julIsDst) {
            test.ok(0, 'January and July cannot both be in DST');
            test.ok(0, 'January and July cannot both be in DST');
        } else if (janIsDst) {
            test.ok(jan1.isDST(), 'January 1 is DST');
            test.ok(!jul1.isDST(), 'July 1 is not DST');
        } else if (julIsDst) {
            test.ok(!jan1.isDST(), 'January 1 is not DST');
            test.ok(jul1.isDST(), 'July 1 is DST');
        } else {
            test.ok(!jan1.isDST(), 'January 1 is not DST');
            test.ok(!jul1.isDST(), 'July 1 is not DST');
        }
        test.done();
    },

    "unix timestamp" : function(test) {
        test.expect(4);

        var m = moment('1234567890.123', 'X');
        test.equals(m.format('X'), '1234567890', 'unix timestamp without milliseconds');
        test.equals(m.format('X.S'), '1234567890.1', 'unix timestamp with deciseconds');
        test.equals(m.format('X.SS'), '1234567890.12', 'unix timestamp with centiseconds');
        test.equals(m.format('X.SSS'), '1234567890.123', 'unix timestamp with milliseconds');

        test.done();
    },

    "zone" : function(test) {
        test.expect(3);

        if (moment().zone() > 0) {
            test.ok(moment().format('ZZ').indexOf('-') > -1, 'When the zone() offset is greater than 0, the ISO offset should be less than zero');
        }
        if (moment().zone() < 0) {
            test.ok(moment().format('ZZ').indexOf('+') > -1, 'When the zone() offset is less than 0, the ISO offset should be greater than zero');
        }
        if (moment().zone() == 0) {
            test.ok(moment().format('ZZ').indexOf('+') > -1, 'When the zone() offset is equal to 0, the ISO offset should be positive zero');
        }
        if (moment().zone() === 0) {
           test.equal(moment().zone(), 0, 'moment.fn.zone should be a multiple of 15 (was ' + moment().zone() + ')');
        } else {
           test.equal(moment().zone() % 15, 0, 'moment.fn.zone should be a multiple of 15 (was ' + moment().zone() + ')');
        }
        test.equal(moment().zone(), new Date().getTimezoneOffset(), 'zone should equal getTimezoneOffset');
        test.done();
    },

    "default format" : function(test) {
        test.expect(1);
        var isoRegex = /\d{4}.\d\d.\d\dT\d\d.\d\d.\d\d[\+\-]\d\d:\d\d/;
        test.ok(isoRegex.exec(moment().format()), "default format (" + moment().format() + ") should match ISO");
        test.done();
    },

    "escaping quotes" : function(test) {
        test.expect(4);
        moment.lang('en');
        var date = moment([2012, 0]);
        test.equal(date.format('MMM \'YY'), "Jan '12", "Should be able to format with single parenthesis");
        test.equal(date.format('MMM "YY'),  'Jan "12', "Should be able to format with double parenthesis");
        test.equal(date.format("MMM 'YY"),  "Jan '12", "Should be able to format with single parenthesis");
        test.equal(date.format("MMM \"YY"), 'Jan "12', "Should be able to format with double parenthesis");
        test.done();
    },

    "toJSON" : function(test) {
        var supportsJson = typeof JSON !== "undefined" && JSON.stringify && JSON.stringify.call,
            date = moment.utc("2012-10-09T20:30:40.678");

        test.expect(supportsJson ? 2 : 1);

        test.equal(date.toJSON(), "2012-10-09T20:30:40.678Z", "should output ISO8601 on moment.fn.toJSON");
        test.equal(JSON.stringify({
            date : date
        }), '{"date":"2012-10-09T20:30:40.678Z"}', "should output ISO8601 on JSON.stringify");
        test.done();
    },

    "weeks format" : function(test) {

        // http://en.wikipedia.org/wiki/ISO_week_date
        var cases = {
            "2005-01-02": "2004-53",
            "2005-12-31": "2005-52",
            "2007-01-01": "2007-01",
            "2007-12-30": "2007-52",
            "2007-12-31": "2008-01",
            "2008-01-01": "2008-01",
            "2008-12-28": "2008-52",
            "2008-12-29": "2009-01",
            "2008-12-30": "2009-01",
            "2008-12-31": "2009-01",
            "2009-01-01": "2009-01",
            "2009-12-31": "2009-53",
            "2010-01-01": "2009-53",
            "2010-01-02": "2009-53",
            "2010-01-03": "2009-53",
        };

        for (var i in cases) {
            var iso = cases[i].split('-').pop();
            var the = moment(i).format('WW');
            test.equal(iso, the, i + ": should be " + iso + ", but " + the);
        }

        test.done();
    },

    "toString is just human readable format" : function(test) {
        test.expect(1);

        var b = moment(new Date(2009, 1, 5, 15, 25, 50, 125));
        test.equal(b.toString(), b.format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ'));
        test.done();
    }
};
