define(['modules/relativedates'], function(RelativeDates) {

    describe("Relative dates", function() {
      
        // make the date static so tests are stable
    	var fakeNow = Date.parse('2012-08-13 12:00:00');
        sinon.useFakeTimers(fakeNow, "Date");

        var epochBug = '2038-01-19 03:14:07';

        it('should show relative dates for timestamps formatted YYYY-MM-DD HH:MM:SS', function(){
	   	
	    	var datesToTest = {
	        	'lessThanAMinuteAgo': {
	        		'date'			 : '2012-08-13 11:59:50',
	        		'expectedOutput' : 'less than a minute ago'
	    		},
	    		'oneMinuteAgo': {  // singular
	        		'date'			 : '2012-08-13 11:58:40',
	        		'expectedOutput' : 'about a minute ago'
	    		},
	    		'upToEightMinutesAgo': { // plural
	        		'date' 			 : '2012-08-13 11:52:30',
	        		'expectedOutput' : 'about 7 minutes ago'
	    		},
	    		'oneHourAgo': { // singular
	        		'date' 			 : '2012-08-13 11:00:00',
	        		'expectedOutput' : 'about an hour ago'
	    		},
	    		'lessThanFiveHoursAgo': { // plural
	        		'date' 			 : '2012-08-13 07:01:00',
	        		'expectedOutput' : 'about 4 hours ago'
	    		},
	    		'moreThanFiveHoursAgo': { // ... but still today
	        		'date' 			 : '2012-08-13 02:03:00',
	        		'expectedOutput' : 'Today, 2:03am'
	    		},
	    		'yesterday': {
	        		'date' 			 : '2012-08-12 23:45:00',
	        		'expectedOutput' : 'Yesterday, 11:45pm'
	    		},
	    		'moreThanTwoDaysAgo': {
	        		'date' 			 : '2012-08-09 08:34:00',
	        		'expectedOutput' : 'Thursday 9 Aug 2012'
	    		},
	    		'moreThanFiveDaysAgo': {
	        		'date' 			 : '2012-08-05 21:30:00',
	        		'expectedOutput' : '5 Aug 2012'
	    		},
	    	};

	    	for (var category in datesToTest) {
		  		var d = datesToTest[category];
		  		expect(RelativeDates.makeRelativeDate(d.date)).toBe(d.expectedOutput);
			}
		});

		it("should just return the input date if said date is in the future", function(){
			expect(RelativeDates.makeRelativeDate(epochBug)).toBe(epochBug);
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
