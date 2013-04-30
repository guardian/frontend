define(['modules/experiments/aware'], function(Aware) {
    
    describe('Aware', function() {

        beforeEach(function() {
            Aware.init()
            localStorage.clear();
        });
        
        // make the date static so tests are stable
    	var fakeLastVisit = Date.parse('2013-04-21T12:00:00+01:00'),
            fakeNow = Date.parse('2013-04-22T12:00:00+01:00');
        
        sinon.useFakeTimers(fakeLastVisit, "Date");

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
            
            // move day forward 6 hours from the epoch & log a visit
            var fakeNow = Date.parse('2013-04-22T04:00:00+01:00');
            sinon.useFakeTimers(fakeNow, "Date");
            Aware.logVisit()

            // move to 8pm the same day and log another visit
            var fakeNow = Date.parse('2013-04-22T20:00:00+01:00');
            sinon.useFakeTimers(fakeNow, "Date");
            Aware.logVisit()

            expect(Aware.visits()).toBe(2);
            expect(Aware.visitsToday()).toBe(2);
           
            // move three days hance and log a final visit
            var fakeNow = Date.parse('2013-04-25T12:00:00+01:00');
            sinon.useFakeTimers(fakeNow, "Date");
            Aware.logVisit()
            
            expect(Aware.visits()).toBe(3);
            expect(Aware.visitsToday()).toBe(1);

        });

        it('should count frequency of visits to different sections over the last few days', function() {
           
            ['foo', 'foo', 'bar'].forEach(function (section) {
                Aware.logVisit(section)
            })

            expect(Aware.visitsBySection('foo')).toBe(2);
            expect(Aware.visits()).toBe(3);
            
        });
        
        it('should be able to wipe the aware data', function() {
           
            ['foo', 'bar'].forEach(function (section) {
                Aware.logVisit(section)
            })

            Aware.remove()

            //expect(Aware.visitsBySection('foo')).toBe(0);
            expect(Aware.visits()).toBe(0);
            
        });

    });
});
