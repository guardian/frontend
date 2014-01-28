/* global document */
'use strict';

/**
 *
 * Article feature tests
 *
 **/

casper.test.setUp(function() {
    casper.start(host + "environment/2014/jan/26/power-failures-future-frequent-blackouts-electricity-supply");
});

casper.test.begin("Show Related Content trails", function(test) {
    casper.then(function testRelatedContent() {
        casper.waitForSelector("#related-content-head", function() {
          test.assertSelectorHasText('#related-content-head', 'Related content');
          test.assertEval(function() {
            return __utils__.findAll(".related__container .item__container").length == 5;
            }, "5 related content items are in the DOM");
          test.done();

        }, function timeout(){
            casper.capture(screens + 'related-content-heading-fail.png');
            test.fail("Failed to find related content");

        });
    });
});


casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get("xunit") + "article.xml");
});
