define(['modules/experiments/aware'], function(Aware) {
    
    describe('Aware', function() {

        beforeEach(function() {
            
            // make the date static so tests are stable
    	    var fakeLastVisit = Date.parse('2013-04-21T12:00:00+01:00'),
                fakeNow = Date.parse('2013-04-22T12:00:00+01:00');
        
            sinon.useFakeTimers(fakeLastVisit, "Date");

            // Clear up the local storage before each test
            Aware.remove()

            // Normally we don't need to initialise the module (as it does that on it's own), but because we are
            // are fiddling around with fake dates and the module initialises as its loaded (via AMD) *before* the sinon date
            // mocking library below, we need to call init every test.
            Aware.init();
        
        });
        

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

        it('should calcuate the number of minutes since my last visit', function() {
            
            var config = { section: 'foo', pageId: 'bar' }
            Aware.logVisit(config)
            
            var fakeNow = Date.parse('2013-04-22T12:00:00+01:00');
            sinon.useFakeTimers(fakeNow, "Date");
            
            expect(Aware.lastVisit()).toBe(1440)

        });

        it('should identify the frequency of visits "today"', function() {
            
            var config = { section: 'foo' }
            
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
        
        it('should record the session length', function() {
            
            var config = { section: 'foo' }
            
            var fakeNow = Date.parse('2013-05-12T07:00:00+01:00');
            sinon.useFakeTimers(fakeNow, "Date");
            Aware.logVisit(config)

            // move time 2 minutes later 
            var fakeNow = Date.parse('2013-05-12T07:02:00+01:00');
            sinon.useFakeTimers(fakeNow, "Date");
            Aware.logVisit(config)
            
            expect(Aware.visits()).toBe(2);
            expect(Aware.visitsInSession()).toBe(2);
            
            // move time 31 minutes later to reset the session
            var fakeNow = Date.parse('2013-05-12T07:33:00+01:00');
            sinon.useFakeTimers(fakeNow, "Date");
            Aware.logVisit(config)
            
            expect(Aware.visitsInSession()).toBe(1);
            expect(Aware.visits()).toBe(3);
        });
        
        it('should identify the entry page type of this session', function() {
            
            var config1 = { section: 'foo', contentType: 'Article' }
            
            var fakeNow = Date.parse('2013-05-12T07:00:00+01:00');
            sinon.useFakeTimers(fakeNow, "Date");
            Aware.logVisit(config1)

            expect(Aware.sessionEntry()).toBe('article');
            
            var config2 = { section: 'foo', contentType: 'Network Front' }
            Aware.logVisit(config2)

            expect(Aware.sessionEntry()).toBe('article');
            
            // move time 60 minutes hence 
            var fakeNow = Date.parse('2013-05-12T08:02:00+01:00');
            sinon.useFakeTimers(fakeNow, "Date");
            Aware.logVisit(config2)
            
            expect(Aware.sessionEntry()).toBe('front');
            
        });
        
        it("should split the entry page type in to either a 'front' or an 'article'", function() {
            
            Aware.logVisit({ contentType: 'Section' })
            expect(Aware.sessionEntry()).toBe('front');
            
            var fakeNow = Date.parse('2013-05-12T08:02:00+01:00');
            sinon.useFakeTimers(fakeNow, "Date");
            
            Aware.logVisit({ contentType: 'Gallery' })
            expect(Aware.sessionEntry()).toBe('article');
        
        });

    });
});
