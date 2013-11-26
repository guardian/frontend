/* global document */
'use strict';

/**
 *
 * Open feature tests
 *
 **/
casper.test.setUp(function() {
    casper.start(host + 'science/grrlscientist/2012/aug/07/3?view=mobile');
    casper.options.waitTimeout = 10000;
});

/**
 *   Scenario: Top comments in Open CTA
 *     Given I am on an article with picked comments
 *     Then I can see one of them in the Open CTA box
 **/
casper.test.begin('Read a top comment in Open CTA', function(test) {
    casper.evaluate(function() {
        guardian.config.switches.openCta = true;
    });
    casper.waitForSelector('.open-cta .comment',
        function then() {
            test.assertElementCount('.open-cta .comment', 1);
            test.done();
        },
        function timeout() {
            casper.capture(screens + 'open-cta-fail.png');
            test.fail('Top comment not loaded in Open CTA');
        });
});

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get('xunit') + 'open.xml');
});