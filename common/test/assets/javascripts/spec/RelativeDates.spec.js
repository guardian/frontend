define(['modules/relativedates'], function(RelativeDates) {

    describe("Relative Dates", function() {
      
        // make the date static so tests are stable
    	var fakeNow = Date.parse('2012-08-13 12:00:00');
        sinon.useFakeTimers(fakeNow, "Date");

        var epochBug = '2038-01-19 03:14:07';

        it('should show relative dates for timestamps formatted YYYY-MM-DD HH:MM:SS', function(){
	   	
	    	var datesToTest = {
	    		'justNow': {
	        		'date'			 : '2012-08-13 11:59:52',
	        		'expectedOutput' : 'just now'
	    		},
	        	'lessThanAMinuteAgo': {
	        		'date'			 : '2012-08-13 11:59:50',
	        		'expectedOutput' : 'less than a minute ago'
	    		},
	    		'aboutAMinuteAgo': {
	        		'date'			 : '2012-08-13 11:58:20',
	        		'expectedOutput' : 'about a minute ago'
	    		},
	    		'severalMinutesAgo': {
	        		'date' 			 : '2012-08-13 11:57:00',
	        		'expectedOutput' : '3 minutes ago'
	    		},
	    		'aboutAnHourAgo': {
	        		'date' 			 : '2012-08-13 11:00:00',
	        		'expectedOutput' : 'about an hour ago'
	    		},
	    		'severalHoursAgo': {
	        		'date' 			 : '2012-08-13 06:00:00',
	        		'expectedOutput' : '6 hours ago'
	    		},
	    		'aboutADayAgo': {
	        		'date' 			 : '2012-08-12 12:00:00',
	        		'expectedOutput' : 'about a day ago'
	    		},
	    		'severalDaysAgo': {
	        		'date' 			 : '2012-08-01 12:00:00',
	        		'expectedOutput' : '12 days ago'
	    		},
	    		'aboutAMonthAgo': {
	        		'date' 			 : '2012-07-13 12:00:00',
	        		'expectedOutput' : 'about a month ago'
	    		},
	    		'severalMonthsAgo': {
	        		'date' 			 : '2012-05-13 12:00:00',
	        		'expectedOutput' : 'about 3 months ago'
	    		},
	    		'aboutAYearAgo': {
	        		'date' 			 : '2011-08-13 12:00:00',
	        		'expectedOutput' : 'about a year ago'
	    		},
	    		'severalYearsAgo': {
	        		'date' 			 : '2006-08-13 12:00:00',
	        		'expectedOutput' : 'about 6 years ago'
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

		it("should fail politely (eg return false) if given non-date / invalid input for either argument", function(){
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
