/* global document */
'use strict';

/**
 *
 * Live Blog feature tests
 *
 **/

casper.test.setUp(function() {
    casper.start(host + "football/2013/nov/19/austria-vs-usa-live?view=mobile");
    casper.options.waitTimeout = 10000;
});

casper.test.begin("Show key events only / all posts", function(test) {
    casper.then(function testKeyEventsToggle() {
        casper.waitForSelector(".live-toggler-wrapper", function() {
            casper.click(".live-toggler--all", "Toggle to show key events only");
            test.assertNotVisible(
                ".article-body .block:not(.is-key-event)",
                "Posts other than key events are hidden"
            );
            test.assertVisible(
                ".article-body .block.is-key-event",
                "Key events are visible"
            );

            casper.click(".live-toggler--key-events", "Toggle to show all posts");
            test.assertVisible(
                ".article-body .block",
                "All posts are visible"
            );

            test.done();
        }, function timeout(){
            casper.capture('live-blog-key-events-fail.png');
            test.fail("Failed to find toggling buttons");
        });
    });
});

casper.test.begin("Display embedded video", function(test) {
    test.assertVisible(
        '#block-528bcd4ae4b00dad55ce28d5 iframe[src^="https://www.youtube.com/embed"]',
        "Embedded video visible"
    );
    test.done();
});

casper.test.begin("Display embedded tweet", function(test) {
    test.assertVisible(
        '#block-528bd329e4b06b8a55a1870d .element-tweet',
        "Embedded tweet visible"
    );
    test.done();
});

casper.test.begin("Display latest summary before events on small viewports", function(test) {
    if (casper.exists('.js-article__summary')) {
        casper.viewport(viewports.mobile.width, viewports.mobile.height);
        test.assertNotVisible(
            '[data-link-name="summary after content"]',
            "RHS summary block not visible on small viewports"
        );
        test.assertVisible(
            '[data-link-name="summary before content"]',
            "Inline summary block visible on small viewports"
        );
        casper.capture('live-mobile.png');
        test.done();
    } else {
        casper.capture('live-blog-summary-1-fail.png');
        test.fail("Summary block not present");
    }
});

casper.test.begin("Display latest summary on the right side of article on wide viewports", function(test) {
    if (casper.exists('.js-article__summary')) {
        casper.viewport(viewports.desktop.width, viewports.desktop.height);
        test.assertVisible(
            '[data-link-name="summary after content"]',
            "RHS summary block visible on wide viewports"
        );
        test.assertNotVisible(
            '[data-link-name="summary before content"]',
            "Inline summary block not visible on wide viewports"
        );
        casper.capture('live-desktop.png');
        test.done();
    } else {
        casper.capture('live-blog-summary-2-fail.png');
        test.fail("Summary block not present");
    }
});

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get("xunit") + "live-blog.xml");
});
