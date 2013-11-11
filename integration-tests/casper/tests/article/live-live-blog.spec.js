/* global document */
'use strict';

/**
 *
 * Live Blog feature tests
 *
 **/

var x = require('casper').selectXPath;
var livePageUri;

casper.start(host + "tone/minutebyminute?view=mobile");

casper.test.begin("Auto update toggle on / off", function(test) {
	casper.waitForSelector('.item__live-indicator', function() {
	    livePageUri = casper.getElementAttribute(x('//*[@class="item__live-indicator"]/ancestor::a'), 'href');
	    if (host.indexOf("http://localhost") !=-1) {
            livePageUri = host + livePageUri.substring(1);
        }
	    
	    casper.thenOpen(livePageUri + "?view=mobile", function() {
	    	casper.waitForSelector('.live-toolbar .update', function() {
	    		test.assertVisible(
			    '.circular-progress--is-on',
			    "Auto update toggle on by default"
		    );
		
		    casper.click('.live-toggler--circle.js-auto-update');
		    test.assertVisible(
		    	'.circular-progress--is-off',
		    	"Auto update toggle switched OFF on click"
		    );
		    test.assertNotVisible(
		    	'.circular-progress--is-on',
		    	"Toggle on button displayed when auto update off"
	    	);

		    casper.click('.live-toggler--circle.js-auto-update');
		    test.assertVisible(
		    	'.circular-progress--is-on',
		    	"Auto update toggle switched ON on click"
		    );
		    test.assertNotVisible(
		    	'.circular-progress--is-off',
		    	"Toggle off button displayed when auto update on"
	    	);
		    
		    test.done();
	    	}, function timeout(){
                test.fail("Failed to find auto update toggle");
            }, 10000);
	    });
    }, function timeout(){
        casper.echo('Failed to find trail for currently live content');
    }, 10000);
});

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get("xunit") + "live-live-blog.xml");
});
