/* global document */
'use strict';

/**
 *
 * Live Blog feature tests
 *
 **/

var casper = require('casper').create();

casper.start(host+ "/football/2013/sep/02/transfer-deadline-day-2013-ozil-fellaini-herrera-bale-live?view=mobile");

casper.test.begin("Show key events only / all posts", function(test) {
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
        test.fail("Failed to find toggling buttons");
    }, 10000);
});



casper.test.begin("Display latest summary before events on small viewports", function(test) {
    if (casper.exists('.js-article__summary')) {
        casper.viewport(320, 480);
        test.assertNotVisible('[data-link-name="summary after content"]');
        test.assertVisible('[data-link-name="summary before content"]');
        test.done();
    }
});

casper.test.begin("Display latest summary on the right side of article on wide viewports", function(test) {
    if (casper.exists('.js-article__summary')) {
        casper.viewport(1024, 768);
        test.assertVisible('[data-link-name="summary after content"]');
        test.assertNotVisible('[data-link-name="summary before content"]');
        test.done();
    }
});


casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get("xunit") + "live-blog.xml");
});
