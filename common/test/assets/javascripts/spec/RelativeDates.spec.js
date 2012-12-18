define(['modules/relativedates', 'bonzo', 'qwery'], function(RelativeDates, bonzo, qwery) {

    describe("Relative dates", function() {
      
        // make the date static so tests are stable
    	var fakeNow = Date.parse('2012-08-13T12:00:00+01:00');
        sinon.useFakeTimers(fakeNow, "Date");

        var epochBug = '2038-01-19T03:14:07';

        it('should show relative dates for timestamps formatted YYYY-MM-DD HH:MM:SS', function(){
	   	
	    	var datesToTest = {
	        	'lessThanAMinuteAgo': {
	        		'date'			 : '2012-08-13T11:59:50+01:00',
	        		'expectedOutput' : 'Less than a minute ago'
	    		},
	    		'oneMinuteAgo': {  // singular
	        		'date'			 : '2012-08-13T11:58:40+01:00',
	        		'expectedOutput' : '1 minute ago'
	    		},
	    		'upToEightMinutesAgo': { // plural
	        		'date' 			 : '2012-08-13T11:52:30+01:00',
	        		'expectedOutput' : '7 min ago'
	    		},
	    		'oneHourAgo': { // singular
	        		'date' 			 : '2012-08-13T11:00:00+01:00',
	        		'expectedOutput' : '1 hour ago'
	    		},
	    		'betweenNinetyMinutesAndOneHour': {  // bug GFE-38
	        		'date' 			 : '2012-08-13T10:25:00+01:00',
	        		'expectedOutput' : '2 hours ago'
	    		},
	    		'lessThanFiveHoursAgo': { // plural
	        		'date' 			 : '2012-08-13T08:30:00+01:00',
	        		'expectedOutput' : '4 hours ago'
	    		},
	    		'moreThanFiveHoursAgo': { // ... but still today
	        		'date' 			 : '2012-08-13T02:03:00+01:00',
	        		'expectedOutput' : 'Today, 2:03am'
	    		},
	    		'yesterday': {
	        		'date' 			 : '2012-08-12T23:45:00+01:00',
	        		'expectedOutput' : 'Yesterday, 11:45pm'
	    		},
	    		'moreThanTwoDaysAgo': {
	        		'date' 			 : '2012-08-09T08:34:00+01:00',
	        		'expectedOutput' : 'Thursday 9 Aug 2012'
	    		},
	    		'moreThanFiveDaysAgo': {
	        		'date' 			 : '2012-08-05T21:30:00+01:00',
	        		'expectedOutput' : '5 Aug 2012'
	    		},
	    		'oneMinuteAgoInAnotherTimeZone': { 
	        		'date'			 : '2012-08-13T12:58:40+02:00',
	        		'expectedOutput' : '1 minute ago'
	    		}
	    	};

	    	for (var category in datesToTest) {
		  		var d = datesToTest[category]
                var epoch = Date.parse(d.date)
		  		expect(RelativeDates.makeRelativeDate(epoch)).toBe(d.expectedOutput);
			}
		});

		it("should just return the input date if said date is in the future", function(){
			expect(RelativeDates.makeRelativeDate(Date.parse(epochBug))).toBeFalsy();
		});

		it("should fail politely if given non-date / invalid input for either argument", function(){
			expect(RelativeDates.makeRelativeDate('foo')).toBeFalsy();
		});
		
		describe('Test output', function() {

	        RelativeDates.init();
	        
            waitsFor(function() {
                return (qwery('.js-timestamp').length === 0)
            }, 'Dates not relativised', 100);
            
            function testOutput(elementId) {
                var testTimestamp = bonzo(qwery('#' + elementId));
                expect(testTimestamp.html()).toBe(testTimestamp.attr('data-expected-output'));
            }

    		it("should convert valid timestamps into their expected output", function(){
                testOutput('relative-date-test-item');
    		});

            it("should convert valid timestamps into their expected output in blocks", function(){
                testOutput('relative-date-test-item-block');
            });
    
            it("should not convert invalid timestamps", function(){
                testOutput('relative-date-invalid-item');
            });
        
		})

    });

})
