/* global document */
'use strict';

/**
 *
 * Most popular feature tests
 *
 **/

casper.test.setUp(function() {
    casper.start(host + "commentisfree/2013/oct/15/mums-carers-treated-like-criminals-hidden-cameras?view=mobile");
});

casper.test.begin("Load Most Read", function(test){
    casper.then(function testMostPopular() {
        casper.waitForSelector("#tabs-popular-1", function() {
            test.assertVisible("#tabs-popular-1", "The most read in this section is visible");
            test.assertNotVisible('#tabs-popular-2', "and the most read in the Guardian is not visible");
            test.assertEvalEquals(function() {
                return document.querySelectorAll('#tabs-popular-1 li').length;
            }, 10, 'Then I can see 10 most popular stories from this section');
            casper.click("[data-link-name='tab 2 The Guardian']");
            test.assertVisible("#tabs-popular-2", "Then the global most popular list is visible after clicking the tab");
            test.done();
        }, function timeout() {
            casper.capture('most-popular-fail.png');
            test.fail('Failed to transclude most read component');
        });
    });
});

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get("xunit") + "most-popular.xml");
});
