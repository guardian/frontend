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

/**
* Scenario: Show related content trails
* Given I am on an article with no story package
* Then I can see 5 related content trails
**/

casper.test.begin("Show Related Content trails", function(test) {
    casper.then(function testRelatedContent() {
        casper.waitForSelector("#related-content-head", function() {
            test.assertSelectorHasText('#related-content-head', 'Related content');
            test.assertElementCount('.related__container .item__container', 5, '5 related content items are in the DOM');
            test.assertVisible('.related__container .item:nth-child(5)','5th trail is visible');
            test.done();
        }, function timeout(){
            casper.capture(screens + 'related-content-heading-fail.png');
            test.fail("Failed to find related content");
        });
    });
});

/**
* Scenario: Show 4 related content trails on Desktop
* Given I am on a desktop viewport
* When I load an article with no story package
* Then I can see 4 related content trails
**/

casper.test.begin("Correct amount of related content trails are visible at different viewports", function(test) {
    casper.viewport(viewports.desktop.width, viewports.desktop.height);
    test.assertVisible('.related__container .item','1st trail is visible at desktop viewport');
    test.assertNotVisible('.related__container .item:nth-child(5)','5th trail is not visible at desktop viewport');
    test.done();
}, function timeout() {
    casper.capture(screens + 'related-content-desktop-fail.png');
    test.fail("5th trail is visible at desktop viewport");
});

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get("xunit") + "article.xml");
});
