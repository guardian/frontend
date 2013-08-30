define(['modules/experiments/aware'], function(Aware) {

    // make the date static so tests are stable
    var fakeLastVisit = Date.parse('2013-04-21T12:00:00+01:00'),
        fakeNow = Date.parse('2013-04-22T12:00:00+01:00');

    describe('Aware', function() {

        beforeEach(function() {
            localStorage.clear();
            sinon.useFakeTimers(fakeLastVisit, "Date");
        });

        afterEach(function() {
            sinon.useFakeTimers().restore();
        });

        it('should exist', function() {
            expect(Aware).toBeDefined();
        });

        it('should identify a first-time visitor', function() {
            expect(Aware.visits()).toBe(0);
            expect(Aware.firstVisit()).toBeTruthy();
        });

        it('should identify a return visitor', function() {
            Aware.logVisit()
            Aware.logVisit()
            Aware.logVisit()
            expect(Aware.visits()).toBe(3);
        });

        it('should calcuate the number of seconds since my last visit', function() {
            Aware.logVisit()
            expect(Aware.lastVisit(fakeNow)).toBe(24)

        });

        it('should identify the frequency of visits "today"', function() {

            Aware.init()

            // move day forward 6 hours
            var fakeNow = Date.parse('2013-04-22T04:00:00+01:00');
            sinon.useFakeTimers(fakeNow, "Date");

            // log another visit 'today' and check we only count a single visit today
            Aware.logVisit()

            var fakeNow = Date.parse('2013-04-22T20:00:00+01:00');
            sinon.useFakeTimers(fakeNow, "Date");

            Aware.logVisit()
            expect(Aware.visits()).toBe(2);
            expect(Aware.visitsToday()).toBe(2);

            var fakeNow = Date.parse('2013-04-25T12:00:00+01:00');
            sinon.useFakeTimers(fakeNow, "Date");

            Aware.logVisit()
            expect(Aware.visits()).toBe(3);
            expect(Aware.visitsToday(fakeNow)).toBe(1);

        });

        it('should count frequency of visits to different sections over the last few days', function() {

            var section1 = 'foo'
            var section2 = 'bar'

            Aware.logVisit(section1)
            Aware.logVisit(section1)
            Aware.logVisit(section2)
            expect(Aware.visitsBySection('foo')).toBe(2);
            expect(Aware.visits()).toBe(3);

        });

    });
});
