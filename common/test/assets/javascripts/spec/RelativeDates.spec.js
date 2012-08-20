define(['modules/relativedates'], function(RelativeDates) {

    describe("Relative dates", function() {
      
        // make the date static so tests are stable
    	var fakeNow = Date.parse('2012-08-13T12:00:00+01:00');
        sinon.useFakeTimers(fakeNow, "Date");

        var epochBug = '2038-01-19T03:14:07';

        it('should show relative dates for timestamps formatted YYYY-MM-DD HH:MM:SS', function(){
	   	
	    	var datesToTest = {
	        	'lessThanAMinuteAgo': {
	        		'date'			 : '2012-08-13T11:59:50+01:00',
	        		'expectedOutput' : 'less than a minute ago'
	    		},
	    		'oneMinuteAgo': {  // singular
	        		'date'			 : '2012-08-13T11:58:40+01:00',
	        		'expectedOutput' : 'about a minute ago'
	    		},
	    		'upToEightMinutesAgo': { // plural
	        		'date' 			 : '2012-08-13T11:52:30+01:00',
	        		'expectedOutput' : 'about 7 minutes ago'
	    		},
	    		'oneHourAgo': { // singular
	        		'date' 			 : '2012-08-13T11:00:00+01:00',
	        		'expectedOutput' : 'about an hour ago'
	    		},
	    		'lessThanFiveHoursAgo': { // plural
	        		'date' 			 : '2012-08-13T07:01:00+01:00',
	        		'expectedOutput' : 'about 4 hours ago'
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
	        		'expectedOutput' : 'about a minute ago'
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

		it("should convert valid timestamps into their expected output", function(){

			// this item has a custom relativeTo value to ensure expected output is consistent
			var testTimestamp = document.getElementById('relative-date-test-item');
			var expectedTestOutput = RelativeDates.makeRelativeDate(testTimestamp.getAttribute('data-timestamp')); 
			var invalidItem = document.getElementById('relative-date-invalid-item')
			var invalidItemTextBefore = invalidItem.innerText;

			runs(function() {
	   			RelativeDates.init(); 
            });

            waits(1);

            runs(function(){
            	expect(testTimestamp.innerText).toBe(expectedTestOutput);
            	expect(invalidItem.innerText).toBe(invalidItemTextBefore);
            });
		});

    });

})
