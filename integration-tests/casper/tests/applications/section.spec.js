/* global document */
'use strict';

/**
 *
 * Live Blog feature tests
 *
 **/

var casper = require('casper').create();

casper.start(host + "football?view=mobile");

casper.test.begin("Display Most Popular", function(test){

    casper.waitForSelector("#tabs-popular-1", function() {
        test.assertVisible("#tabs-popular-1", "Section most popular is visible");
        casper.click("[data-link-name='tab 2 The Guardian']")
        test.assertVisible("#tabs-popular-2", "Global most popular is visible");
        test.done();
    });
});

casper.test.begin("Show top stories", function(test){
    casper.click('.control--sections');
    casper.waitUntilVisible(".nav-popup-sections", function() {
        test.assertVisible(".nav-popup-sections", "Top stories is visible");
    });
    test.done();

});

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get("xunit") + "applications.xml");
});
