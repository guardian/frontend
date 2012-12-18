define(['modules/relativedates', 
        'bonzo', 
        'fixtures',
        'qwery'], function(RelativeDates, bonzo, fixtures, qwery) {
    
    var conf =  {
            id: 'relative-dates',
            fixtures: [
                        '<time id="time-valid" class="js-timestamp" datetime="2012-08-12T18:43:00.000Z">12th August</time>',
                        '<time id="time-invalid" class="js-timestamp" datetime="201-08-12agd18:43:00.000Z">Last Tuesday</time>'
                       ]
                }

    describe("Relative dates", function() {
       
        beforeEach(function() {
            fixtures.render(conf);
        })

        // make the date static so tests are stable
    	var fakeNow = Date.parse('2012-08-13T12:00:00+01:00');
        sinon.useFakeTimers(fakeNow, "Date");

        var epochBug = '2038-01-19T03:14:07';

        it('Show relative dates for timestamps formatted as YYYY-MM-DD HH:MM:SS', function(){
	   	
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

		it("Return the input date if said date is in the future", function(){
			expect(RelativeDates.makeRelativeDate(Date.parse(epochBug))).toBeFalsy();
		});

		it("Fail politely if given non-date / invalid input for either argument", function(){
			expect(RelativeDates.makeRelativeDate('foo')).toBeFalsy();
		});
		
        it("Convert valid timestamps in the HTML document into their expected output", function(){
            RelativeDates.init();
            expect(document.getElementById('time-valid').innerHTML).toBe('<span title="12th August">Yesterday, 7:43pm</span>');
        });
        
        // each XHR load event fires replaceValidTimestamps(), so we want to avoid replacing date twice
        it("Once converted remove the need to convert them again", function(){
            RelativeDates.init();
            expect(document.getElementById('time-valid').className).not.toContain('js-timestamp');
        });

        it("Ignore invalid timestamps", function(){
            RelativeDates.init();
            expect(document.getElementById('time-invalid').innerHTML).toBe('Last Tuesday');
        });

    });

})
