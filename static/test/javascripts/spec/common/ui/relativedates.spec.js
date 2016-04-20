define(['common/modules/ui/relativedates',
    'helpers/fixtures'],
function (RelativeDates, fixtures) {
    var conf =  {
        id: 'relative-dates',
        fixtures: [
                    '<time id="time-valid" class="js-timestamp" datetime="2012-08-12T18:43:00.000Z">12th August</time>',
                    '<time id="time-invalid" class="js-timestamp" datetime="201-08-12agd18:43:00.000Z">Last Tuesday</time>',
                    '<time id="time-locale" class="js-locale-timestamp" datetime="2014-06-13T17:00:00+0100" data-timestamp="1402675200000">17:00</time>'
                   ]
    },
    // make the date static so tests are stable
    fakeNow = Date.parse('2012-08-13T12:00:00+01:00'),
    date;

    describe('Relative dates', function () {

        beforeEach(function () {
            fixtures.render(conf);
            date = sinon.useFakeTimers(fakeNow, 'Date');
        });

        afterEach(function () {
            fixtures.clean(conf.id);
            date.restore();
        });

        var epochBug = '2038-01-19T03:14:07';

        var datesToTest = {
                'lessThanAMinuteAgo': {
                    'date'           :      '2012-08-13T11:59:50+01:00',
                    'expectedOutput' :      '10s',
                    'expectedShortOutput' : '10s',
                    'expectedMedOutput' :   '10s ago',
                    'expectedLongOutput' : '10 seconds ago'
                },
                'oneMinuteAgo': {  // singular
                    'date'           :      '2012-08-13T11:58:40+01:00',
                    'expectedOutput' :      '1m',
                    'expectedShortOutput' : '1m',
                    'expectedMedOutput' :   '1m ago',
                    'expectedLongOutput' :  '1 minute ago'
                },
                'upToEightMinutesAgo': { // plural
                    'date'           :      '2012-08-13T11:52:30+01:00',
                    'expectedOutput' :      '8m',
                    'expectedShortOutput' : '8m',
                    'expectedMedOutput' :   '8m ago',
                    'expectedLongOutput' :  '8 minutes ago'
                },
                'oneHourAgo': { // singular
                    'date'           :      '2012-08-13T11:00:00+01:00',
                    'expectedOutput' :      '1h',
                    'expectedShortOutput' : '1h',
                    'expectedMedOutput' :   '1h ago',
                    'expectedLongOutput' :  '1 hour ago'
                },
                'betweenNinetyMinutesAndOneHour': {  // bug GFE-38
                    'date'           :      '2012-08-13T10:25:00+01:00',
                    'expectedOutput' :      '2h',
                    'expectedShortOutput' : '2h',
                    'expectedMedOutput' :   '2h ago',
                    'expectedLongOutput' :  '2 hours ago'
                },
                'lessThanFiveHoursAgo': { // plural
                    'date'           :      '2012-08-13T08:30:00+01:00',
                    'expectedOutput' :      '4h',
                    'expectedShortOutput' : '4h',
                    'expectedMedOutput' :   '4h ago',
                    'expectedLongOutput' :  '4 hours ago'
                },
                'moreThanFiveHoursAgo': { // ... but still today
                    'date'           :      '2012-08-13T02:03:00+01:00',
                    'expectedOutput' :      '10h',
                    'expectedShortOutput' : '10h',
                    'expectedMedOutput' :   '10h ago',
                    'expectedLongOutput' :  '10 hours ago'
                },
                'yesterday': {
                    'date'           :      '2012-08-12T08:45:00+01:00',
                    'expectedOutput' :      'Yesterday 8:45',
                    'expectedShortOutput' : '1d',
                    'expectedMedOutput' :   '1d ago',
                    'expectedLongOutput' :  'Yesterday 8:45'
                },
                'yesterdayButWithinTwentyFourHours': {
                    'date'           :      '2012-08-12T20:00:00+01:00',
                    'expectedOutput' :      'Yesterday 20:00',
                    'expectedShortOutput' : '16h',
                    'expectedMedOutput' :   '16h ago',
                    'expectedLongOutput' :  'Yesterday 20:00'
                },
                'moreThanTwoDaysAgo': {
                    'date'           :      '2012-08-09T08:34:00+01:00',
                    'expectedOutput' :      'Thursday 9 Aug 2012',
                    'expectedShortOutput' : '4d',
                    'expectedMedOutput' :   '4d ago',
                    'expectedLongOutput' :  'Thursday 9 Aug 2012'
                },
                'moreThanFiveDaysAgo': {
                    'date'           :      '2012-08-05T21:30:00+01:00',
                    'expectedOutput' :      '5 Aug 2012',
                    'expectedShortOutput' : '5 Aug 2012',
                    'expectedMedOutput'   : '5 Aug 2012',
                    'expectedLongOutput' :  '5 Aug 2012'
                },
                'oneMinuteAgoInAnotherTimeZone': {
                    'date'           :      '2012-08-13T12:58:40+02:00',
                    'expectedOutput' :      '1m',
                    'expectedShortOutput' : '1m',
                    'expectedMedOutput'   : '1m ago',
                    'expectedLongOutput' :  '1 minute ago'
                }
            };

        for (var category in datesToTest) {
            /*eslint-disable no-loop-func*/
            describe('Show relative dates for timestamps formatted as YYYY-MM-DD HH:MM:SS [' + category + ']', function () {
                    var d     = datesToTest[category],
                        epoch = Date.parse(d.date);
                    it('standard', function () {
                        expect(RelativeDates.makeRelativeDate(epoch)).toBe(d.expectedOutput);
                    });
                    it('short', function () {
                        // Do the same but in short format
                        expect(RelativeDates.makeRelativeDate(epoch, { format: 'short' })).toBe(d.expectedShortOutput);
                    });
                    it('med', function () {
                        expect(RelativeDates.makeRelativeDate(epoch, { format: 'med' })).toBe(d.expectedMedOutput);
                    });
                    it('long', function () {
                        // and long format
                        expect(RelativeDates.makeRelativeDate(epoch, { format: 'long' })).toBe(d.expectedLongOutput);
                    });
                });
            /*eslint-enable no-loop-func*/
        }

        it('Return the input date if said date is in the future', function () {
            expect(RelativeDates.makeRelativeDate(Date.parse(epochBug))).toBeFalsy();
        });

        it('Fail politely if given non-date / invalid input for either argument', function () {
            expect(RelativeDates.makeRelativeDate('foo')).toBeFalsy();
        });

        it('Fail politely if the date is older than a \'notAfter\' value', function () {
            expect(RelativeDates.makeRelativeDate(Date.parse(fakeNow), {notAfter: 3600})).toBeFalsy();
        });

        it('Convert valid timestamps in the HTML document into their expected output', function () {
            RelativeDates.init();
            expect(document.getElementById('time-valid').innerHTML).toBe('Yesterday 19:43');
            expect(document.getElementById('time-valid').getAttribute('title')).toBe('12th August');
        });

        it('Ignore invalid timestamps', function () {
            RelativeDates.init();
            expect(document.getElementById('time-invalid').innerHTML).toBe('Last Tuesday');
        });

        it('Should convert timestamps to users locale', function () {
            RelativeDates.init();
            expect(document.getElementById('time-locale').innerHTML).toBe('17:00');
        });

    });
});
