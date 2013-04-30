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
            var config = { section: 'foo', pageId: 'bar' }
            Aware.logVisit(config)
            Aware.logVisit(config)
            Aware.logVisit(config)
            expect(Aware.visits()).toBe(3);
        });

        it('should calcuate the number of seconds since my last visit', function() {
            
            var config = { section: 'foo', pageId: 'bar' }
            Aware.logVisit(config)
            
            var fakeNow = Date.parse('2013-04-22T12:00:00+01:00');
            sinon.useFakeTimers(fakeNow, "Date");
            
            expect(Aware.lastVisit()).toBe(24)

        });

        it('should identify the frequency of visits "today"', function() {
            
            var config = { section: 'foo', pageId: 'bar' }
            Aware.init() 
            
            // move day forward 6 hours from the epoch & log a visit
            var fakeNow = Date.parse('2013-04-22T04:00:00+01:00');
            sinon.useFakeTimers(fakeNow, "Date");
            Aware.logVisit(config)

            // move to 8pm the same day and log another visit
            var fakeNow = Date.parse('2013-04-22T20:00:00+01:00');
            sinon.useFakeTimers(fakeNow, "Date");
            Aware.logVisit(config)

            expect(Aware.visits()).toBe(2);
            expect(Aware.visitsToday()).toBe(2);
           
            // move three days hance and log a final visit
            var fakeNow = Date.parse('2013-04-25T12:00:00+01:00');
            sinon.useFakeTimers(fakeNow, "Date");
            Aware.logVisit(config)
            
            expect(Aware.visits()).toBe(3);
            expect(Aware.visitsToday()).toBe(1);

        });

        it('should count frequency of visits to different sections over the last few days', function() {
            
            ['foo', 'foo', 'bar'].forEach(function (section) {
                var config = { section: section, pageId: 'bar' }
                Aware.logVisit(config)
            })

            expect(Aware.visitsBySection('foo')).toBe(2);
            expect(Aware.visits()).toBe(3);
            
        });
        
        it('should be able to wipe the aware data', function() {
           
            ['foo', 'bar'].forEach(function (section) {
                Aware.logVisit(section)
            })

            Aware.remove()
            expect(Aware.visits()).toBe(0);
            
        });
        
        it('should record my path through the site in the current session', function() {
           
            // 5pm
            var fakeNow = Date.parse('2013-04-28T17:00:00+01:00');
            sinon.useFakeTimers(fakeNow, "Date");

            ['foo', 'bar', 'car'].forEach(function (section) {
                var config = { section: section, pageId: section }
                Aware.logVisit(config)
            })
            
            expect(Aware.path().toString()).toBe(['foo', 'bar', 'car'].toString());
            
            // 6pm
            var fakeNow = Date.parse('2013-04-28T18:00:00+01:00');
            sinon.useFakeTimers(fakeNow, "Date");
            
            var config = { section: 's', pageId: 'blah' }
            Aware.logVisit(config)
            expect(Aware.path().toString()).toBe(['blah'].toString());

        });
        
        xit('should record my entry page type', function() {
            // unshift the path array
        });

    });
});
