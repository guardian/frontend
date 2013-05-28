var moment = require("../../moment");


    /**************************************************
      Esperanto
     *************************************************/

exports["lang:eo"] = {
    setUp : function (cb) {
        moment.lang('eo');
        cb();
    },

    tearDown : function (cb) {
        moment.lang('en');
        cb();
    },

    "parse" : function(test) {
        test.expect(96);

        var tests = 'januaro jan_februaro feb_marto mar_aprilo apr_majo maj_junio jun_julio jul_aŭgusto aŭg_septembro sep_oktobro okt_novembro nov_decembro dec'.split("_");
        var i;
        function equalTest(input, mmm, i) {
            test.equal(moment(input, mmm).month(), i, input + ' should be month ' + (i + 1));
        }
        for (i = 0; i < 12; i++) {
            tests[i] = tests[i].split(' ');
            equalTest(tests[i][0], 'MMM', i);
            equalTest(tests[i][1], 'MMM', i);
            equalTest(tests[i][0], 'MMMM', i);
            equalTest(tests[i][1], 'MMMM', i);
            equalTest(tests[i][0].toLocaleLowerCase(), 'MMMM', i);
            equalTest(tests[i][1].toLocaleLowerCase(), 'MMMM', i);
            equalTest(tests[i][0].toLocaleUpperCase(), 'MMMM', i);
            equalTest(tests[i][1].toLocaleUpperCase(), 'MMMM', i);
        }
        test.done();
    },

    "format" : function(test) {
        test.expect(22);

        var a = [
                ['dddd, MMMM Do YYYY, h:mm:ss a',      'Dimanĉo, februaro 14a 2010, 3:25:50 p.t.m.'],
                ['ddd, hA',                            'Dim, 3P.T.M.'],
                ['M Mo MM MMMM MMM',                   '2 2a 02 februaro feb'],
                ['YYYY YY',                            '2010 10'],
                ['D Do DD',                            '14 14a 14'],
                ['d do dddd ddd dd',                   '0 0a Dimanĉo Dim Di'],
                ['DDD DDDo DDDD',                      '45 45a 045'],
                ['w wo ww',                            '7 7a 07'],
                ['h hh',                               '3 03'],
                ['H HH',                               '15 15'],
                ['m mm',                               '25 25'],
                ['s ss',                               '50 50'],
                ['a A',                                'p.t.m. P.T.M.'],
                ['\\l\\a DDDo t\\ago \\d\\e \\l\\a j\\aro', 'la 45a tago de la jaro'],
                ['L',                                  '2010-02-14'],
                ['LL',                                 '14-an de februaro, 2010'],
                ['LLL',                                '14-an de februaro, 2010 15:25'],
                ['LLLL',                               'Dimanĉo, la 14-an de februaro, 2010 15:25'],
                ['l',                                  '2010-2-14'],
                ['ll',                                 '14-an de feb, 2010'],
                ['lll',                                '14-an de feb, 2010 15:25'],
                ['llll',                               'Dim, la 14-an de feb, 2010 15:25']
            ],
            b = moment(new Date(2010, 1, 14, 15, 25, 50, 125)),
            i;
        for (i = 0; i < a.length; i++) {
            test.equal(b.format(a[i][0]), a[i][1], a[i][0] + ' ---> ' + a[i][1]);
        }
        test.done();
    },

    "format ordinal" : function(test) {
        test.expect(31);

        test.equal(moment([2011, 0, 1]).format('DDDo'), '1a', '1a');
        test.equal(moment([2011, 0, 2]).format('DDDo'), '2a', '2a');
        test.equal(moment([2011, 0, 3]).format('DDDo'), '3a', '3a');
        test.equal(moment([2011, 0, 4]).format('DDDo'), '4a', '4a');
        test.equal(moment([2011, 0, 5]).format('DDDo'), '5a', '5a');
        test.equal(moment([2011, 0, 6]).format('DDDo'), '6a', '6a');
        test.equal(moment([2011, 0, 7]).format('DDDo'), '7a', '7a');
        test.equal(moment([2011, 0, 8]).format('DDDo'), '8a', '8a');
        test.equal(moment([2011, 0, 9]).format('DDDo'), '9a', '9a');
        test.equal(moment([2011, 0, 10]).format('DDDo'), '10a', '10a');

        test.equal(moment([2011, 0, 11]).format('DDDo'), '11a', '11a');
        test.equal(moment([2011, 0, 12]).format('DDDo'), '12a', '12a');
        test.equal(moment([2011, 0, 13]).format('DDDo'), '13a', '13a');
        test.equal(moment([2011, 0, 14]).format('DDDo'), '14a', '14a');
        test.equal(moment([2011, 0, 15]).format('DDDo'), '15a', '15a');
        test.equal(moment([2011, 0, 16]).format('DDDo'), '16a', '16a');
        test.equal(moment([2011, 0, 17]).format('DDDo'), '17a', '17a');
        test.equal(moment([2011, 0, 18]).format('DDDo'), '18a', '18a');
        test.equal(moment([2011, 0, 19]).format('DDDo'), '19a', '19a');
        test.equal(moment([2011, 0, 20]).format('DDDo'), '20a', '20a');

        test.equal(moment([2011, 0, 21]).format('DDDo'), '21a', '21a');
        test.equal(moment([2011, 0, 22]).format('DDDo'), '22a', '22a');
        test.equal(moment([2011, 0, 23]).format('DDDo'), '23a', '23a');
        test.equal(moment([2011, 0, 24]).format('DDDo'), '24a', '24a');
        test.equal(moment([2011, 0, 25]).format('DDDo'), '25a', '25a');
        test.equal(moment([2011, 0, 26]).format('DDDo'), '26a', '26a');
        test.equal(moment([2011, 0, 27]).format('DDDo'), '27a', '27a');
        test.equal(moment([2011, 0, 28]).format('DDDo'), '28a', '28a');
        test.equal(moment([2011, 0, 29]).format('DDDo'), '29a', '29a');
        test.equal(moment([2011, 0, 30]).format('DDDo'), '30a', '30a');

        test.equal(moment([2011, 0, 31]).format('DDDo'), '31a', '31a');
        test.done();
    },

    "format month" : function(test) {
        test.expect(12);

        var expected = 'januaro jan_februaro feb_marto mar_aprilo apr_majo maj_junio jun_julio jul_aŭgusto aŭg_septembro sep_oktobro okt_novembro nov_decembro dec'.split("_");
        var i;
        for (i = 0; i < expected.length; i++) {
            test.equal(moment([2011, i, 1]).format('MMMM MMM'), expected[i], expected[i]);
        }
        test.done();
    },

    "format week" : function(test) {
        test.expect(7);

        var expected = 'Dimanĉo Dim Di_Lundo Lun Lu_Mardo Mard Ma_Merkredo Merk Me_Ĵaŭdo Ĵaŭ Ĵa_Vendredo Ven Ve_Sabato Sab Sa'.split("_");
        var i;
        for (i = 0; i < expected.length; i++) {
            test.equal(moment([2011, 0, 2 + i]).format('dddd ddd dd'), expected[i], expected[i]);
        }
        test.done();
    },

    "from" : function(test) {
        test.expect(30);

        var start = moment([2007, 1, 28]);
        test.equal(start.from(moment([2007, 1, 28]).add({s:44}), true),  "sekundoj", "44 seconds = a few seconds");
        test.equal(start.from(moment([2007, 1, 28]).add({s:45}), true),  "minuto",      "45 seconds = a minute");
        test.equal(start.from(moment([2007, 1, 28]).add({s:89}), true),  "minuto",      "89 seconds = a minute");
        test.equal(start.from(moment([2007, 1, 28]).add({s:90}), true),  "2 minutoj",     "90 seconds = 2 minutes");
        test.equal(start.from(moment([2007, 1, 28]).add({m:44}), true),  "44 minutoj",    "44 minutes = 44 minutes");
        test.equal(start.from(moment([2007, 1, 28]).add({m:45}), true),  "horo",       "45 minutes = an hour");
        test.equal(start.from(moment([2007, 1, 28]).add({m:89}), true),  "horo",       "89 minutes = an hour");
        test.equal(start.from(moment([2007, 1, 28]).add({m:90}), true),  "2 horoj",       "90 minutes = 2 hours");
        test.equal(start.from(moment([2007, 1, 28]).add({h:5}), true),   "5 horoj",       "5 hours = 5 hours");
        test.equal(start.from(moment([2007, 1, 28]).add({h:21}), true),  "21 horoj",      "21 hours = 21 hours");
        test.equal(start.from(moment([2007, 1, 28]).add({h:22}), true),  "tago",         "22 hours = a day");
        test.equal(start.from(moment([2007, 1, 28]).add({h:35}), true),  "tago",         "35 hours = a day");
        test.equal(start.from(moment([2007, 1, 28]).add({h:36}), true),  "2 tagoj",        "36 hours = 2 days");
        test.equal(start.from(moment([2007, 1, 28]).add({d:1}), true),   "tago",         "1 day = a day");
        test.equal(start.from(moment([2007, 1, 28]).add({d:5}), true),   "5 tagoj",        "5 days = 5 days");
        test.equal(start.from(moment([2007, 1, 28]).add({d:25}), true),  "25 tagoj",       "25 days = 25 days");
        test.equal(start.from(moment([2007, 1, 28]).add({d:26}), true),  "monato",       "26 days = a month");
        test.equal(start.from(moment([2007, 1, 28]).add({d:30}), true),  "monato",       "30 days = a month");
        test.equal(start.from(moment([2007, 1, 28]).add({d:45}), true),  "monato",       "45 days = a month");
        test.equal(start.from(moment([2007, 1, 28]).add({d:46}), true),  "2 monatoj",      "46 days = 2 months");
        test.equal(start.from(moment([2007, 1, 28]).add({d:74}), true),  "2 monatoj",      "75 days = 2 months");
        test.equal(start.from(moment([2007, 1, 28]).add({d:76}), true),  "3 monatoj",      "76 days = 3 months");
        test.equal(start.from(moment([2007, 1, 28]).add({M:1}), true),   "monato",       "1 month = a month");
        test.equal(start.from(moment([2007, 1, 28]).add({M:5}), true),   "5 monatoj",      "5 months = 5 months");
        test.equal(start.from(moment([2007, 1, 28]).add({d:344}), true), "11 monatoj",     "344 days = 11 months");
        test.equal(start.from(moment([2007, 1, 28]).add({d:345}), true), "jaro",        "345 days = a year");
        test.equal(start.from(moment([2007, 1, 28]).add({d:547}), true), "jaro",        "547 days = a year");
        test.equal(start.from(moment([2007, 1, 28]).add({d:548}), true), "2 jaroj",       "548 days = 2 years");
        test.equal(start.from(moment([2007, 1, 28]).add({y:1}), true),   "jaro",        "1 year = a year");
        test.equal(start.from(moment([2007, 1, 28]).add({y:5}), true),   "5 jaroj",       "5 years = 5 years");
        test.done();
    },

    "suffix" : function(test) {
        test.expect(2);
        test.equal(moment(30000).from(0), "je sekundoj",  "je prefix");
        test.equal(moment(0).from(30000), "antaŭ sekundoj", "antaŭ prefix");
        test.done();
    },

    "now from now" : function(test) {
        test.expect(1);
        test.equal(moment().fromNow(), "antaŭ sekundoj",  "now from now should display as in the past");
        test.done();
    },

    "fromNow" : function(test) {
        test.expect(2);
        test.equal(moment().add({s:30}).fromNow(), "je sekundoj", "je sekundoj");
        test.equal(moment().add({d:5}).fromNow(), "je 5 tagoj", "je 5 tagoj");
        test.done();
    },

    "calendar day" : function(test) {
        test.expect(6);

        var a = moment().hours(2).minutes(0).seconds(0);

        test.equal(moment(a).calendar(),                     "Hodiaŭ je 02:00",     "today at the same time");
        test.equal(moment(a).add({ m: 25 }).calendar(),      "Hodiaŭ je 02:25",     "Now plus 25 min");
        test.equal(moment(a).add({ h: 1 }).calendar(),       "Hodiaŭ je 03:00",     "Now plus 1 hour");
        test.equal(moment(a).add({ d: 1 }).calendar(),       "Morgaŭ je 02:00",  "tomorrow at the same time");
        test.equal(moment(a).subtract({ h: 1 }).calendar(),  "Hodiaŭ je 01:00",     "Now minus 1 hour");
        test.equal(moment(a).subtract({ d: 1 }).calendar(),  "Hieraŭ je 02:00", "yesterday at the same time");
        test.done();
    },

    "calendar next week" : function(test) {
        test.expect(15);

        var i;
        var m;

        for (i = 2; i < 7; i++) {
            m = moment().add({ d: i });
            test.equal(m.calendar(),       m.format('dddd [je] LT'),  "Today + " + i + " days current time");
            m.hours(0).minutes(0).seconds(0).milliseconds(0);
            test.equal(m.calendar(),       m.format('dddd [je] LT'),  "Today + " + i + " days beginning of day");
            m.hours(23).minutes(59).seconds(59).milliseconds(999);
            test.equal(m.calendar(),       m.format('dddd [je] LT'),  "Today + " + i + " days end of day");
        }
        test.done();
    },

    "calendar last week" : function(test) {
        test.expect(15);

        var i;
        var m;

        for (i = 2; i < 7; i++) {
            m = moment().subtract({ d: i });
            test.equal(m.calendar(),       m.format('[pasinta] dddd [je] LT'),  "Today - " + i + " days current time");
            m.hours(0).minutes(0).seconds(0).milliseconds(0);
            test.equal(m.calendar(),       m.format('[pasinta] dddd [je] LT'),  "Today - " + i + " days beginning of day");
            m.hours(23).minutes(59).seconds(59).milliseconds(999);
            test.equal(m.calendar(),       m.format('[pasinta] dddd [je] LT'),  "Today - " + i + " days end of day");
        }
        test.done();
    },

    "calendar all else" : function(test) {
        test.expect(4);

        var weeksAgo = moment().subtract({ w: 1 });
        var weeksFromNow = moment().add({ w: 1 });

        test.equal(weeksAgo.calendar(),       weeksAgo.format('L'),  "1 week ago");
        test.equal(weeksFromNow.calendar(),   weeksFromNow.format('L'),  "in 1 week");

        weeksAgo = moment().subtract({ w: 2 });
        weeksFromNow = moment().add({ w: 2 });

        test.equal(weeksAgo.calendar(),       weeksAgo.format('L'),  "2 weeks ago");
        test.equal(weeksFromNow.calendar(),   weeksFromNow.format('L'),  "in 2 weeks");

        test.done();
    },

    // Monday is the first day of the week.
    // The week that contains Jan 1st is the first week of the year.

    "weeks year starting sunday" : function(test) {
        test.expect(5);

        test.equal(moment([2011, 11, 26]).week(), 1, "Dec 26 2011 should be week 1");
        test.equal(moment([2012,  0,  1]).week(), 1, "Jan  1 2012 should be week 1");
        test.equal(moment([2012,  0,  2]).week(), 2, "Jan  2 2012 should be week 2");
        test.equal(moment([2012,  0,  8]).week(), 2, "Jan  8 2012 should be week 2");
        test.equal(moment([2012,  0,  9]).week(), 3, "Jan  9 2012 should be week 3");

        test.done();
    },

    "weeks year starting monday" : function(test) {
        test.expect(5);

        test.equal(moment([2007, 0, 1]).week(),  1, "Jan  1 2007 should be week 1");
        test.equal(moment([2007, 0, 7]).week(),  1, "Jan  7 2007 should be week 1");
        test.equal(moment([2007, 0, 8]).week(),  2, "Jan  8 2007 should be week 2");
        test.equal(moment([2007, 0, 14]).week(), 2, "Jan 14 2007 should be week 2");
        test.equal(moment([2007, 0, 15]).week(), 3, "Jan 15 2007 should be week 3");

        test.done();
    },

    "weeks year starting tuesday" : function(test) {
        test.expect(6);

        test.equal(moment([2007, 11, 31]).week(), 1, "Dec 31 2007 should be week 1");
        test.equal(moment([2008,  0,  1]).week(), 1, "Jan  1 2008 should be week 1");
        test.equal(moment([2008,  0,  6]).week(), 1, "Jan  6 2008 should be week 1");
        test.equal(moment([2008,  0,  7]).week(), 2, "Jan  7 2008 should be week 2");
        test.equal(moment([2008,  0, 13]).week(), 2, "Jan 13 2008 should be week 2");
        test.equal(moment([2008,  0, 14]).week(), 3, "Jan 14 2008 should be week 3");

        test.done();
    },

    "weeks year starting wednesday" : function(test) {
        test.expect(6);

        test.equal(moment([2002, 11, 30]).week(), 1, "Dec 30 2002 should be week 1");
        test.equal(moment([2003,  0,  1]).week(), 1, "Jan  1 2003 should be week 1");
        test.equal(moment([2003,  0,  5]).week(), 1, "Jan  5 2003 should be week 1");
        test.equal(moment([2003,  0,  6]).week(), 2, "Jan  6 2003 should be week 2");
        test.equal(moment([2003,  0, 12]).week(), 2, "Jan 12 2003 should be week 2");
        test.equal(moment([2003,  0, 13]).week(), 3, "Jan 13 2003 should be week 3");

        test.done();
    },

    "weeks year starting thursday" : function(test) {
        test.expect(6);

        test.equal(moment([2008, 11, 29]).week(), 1, "Dec 29 2008 should be week 1");
        test.equal(moment([2009,  0,  1]).week(), 1, "Jan  1 2009 should be week 1");
        test.equal(moment([2009,  0,  4]).week(), 1, "Jan  4 2009 should be week 1");
        test.equal(moment([2009,  0,  5]).week(), 2, "Jan  5 2009 should be week 2");
        test.equal(moment([2009,  0, 11]).week(), 2, "Jan 11 2009 should be week 2");
        test.equal(moment([2009,  0, 12]).week(), 3, "Jan 12 2009 should be week 3");

        test.done();
    },

    "weeks year starting friday" : function(test) {
        test.expect(6);

        test.equal(moment([2009, 11, 28]).week(), 1, "Dec 28 2009 should be week 1");
        test.equal(moment([2010,  0,  1]).week(), 1, "Jan  1 2010 should be week 1");
        test.equal(moment([2010,  0,  3]).week(), 1, "Jan  3 2010 should be week 1");
        test.equal(moment([2010,  0,  4]).week(), 2, "Jan  4 2010 should be week 2");
        test.equal(moment([2010,  0, 10]).week(), 2, "Jan 10 2010 should be week 2");
        test.equal(moment([2010,  0, 11]).week(), 3, "Jan 11 2010 should be week 3");

        test.done();
    },

    "weeks year starting saturday" : function(test) {
        test.expect(6);

        test.equal(moment([2010, 11, 27]).week(), 1, "Dec 27 2010 should be week 1");
        test.equal(moment([2011,  0,  1]).week(), 1, "Jan  1 2011 should be week 1");
        test.equal(moment([2011,  0,  2]).week(), 1, "Jan  2 2011 should be week 1");
        test.equal(moment([2011,  0,  3]).week(), 2, "Jan  3 2011 should be week 2");
        test.equal(moment([2011,  0,  9]).week(), 2, "Jan  9 2011 should be week 2");
        test.equal(moment([2011,  0, 10]).week(), 3, "Jan 10 2011 should be week 3");

        test.done();
    },

    "weeks year starting sunday formatted" : function(test) {
        test.expect(5);

        test.equal(moment([2011, 11, 26]).format('w ww wo'), '1 01 1a', "Dec 26 2011 should be week 1");
        test.equal(moment([2012,  0,  1]).format('w ww wo'), '1 01 1a', "Jan  1 2012 should be week 1");
        test.equal(moment([2012,  0,  2]).format('w ww wo'), '2 02 2a', "Jan  2 2012 should be week 2");
        test.equal(moment([2012,  0,  8]).format('w ww wo'), '2 02 2a', "Jan  8 2012 should be week 2");
        test.equal(moment([2012,  0,  9]).format('w ww wo'), '3 03 3a', "Jan  9 2012 should be week 3");

        test.done();
    }
};
