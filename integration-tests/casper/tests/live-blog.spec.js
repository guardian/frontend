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
            ".article-body > .block:not(.is-key-event)",
            "Posts other than key events are hidden"
        );
        test.assertVisible(
            ".article-body > .block.is-key-event",
            "Key events are visible"
        );

        casper.click(".live-toggler--key-events", "Toggle to show all posts");
        test.assertVisible(
            ".article-body > .block",
            "All posts are visible"
        );

        test.done();
    }, function timeout(){
        test.fail("Failed to find toggling buttons");
    }, 10000);
});

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get("xunit") + "live-blog.xml");
});
