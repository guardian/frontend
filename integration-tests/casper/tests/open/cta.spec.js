/* global document */
'use strict';

/**
 *
 * Open feature tests
 *
 **/
casper.test.setUp(function() {
    casper.start(host + 'commentisfree/2013/aug/09/comment-week-having-children-selfless?view=mobile');
    casper.options.waitTimeout = 10000;
});

/**
 *   Scenario: Top comments in Open CTA
 *     Given I am on an article with picked comments
 *     Then I can see them in the Open CTA box
 **/
casper.test.begin('Read a top comment in Open CTA', function(test) {
    casper.then(function() {
        var openCtaSwitch =  casper.evaluate(function(){
            return guardian.config.switches.openCta;
        });
        this.test.assert(openCtaSwitch = true, 'Open CTA switch is turned ON');
    });

    casper.waitForSelector('#top-comments',
        function then() {
            test.assertElementCount('li[id^="top-comment-"].d-comment--top-level', 3, '3 Featured Comments in the DOM');
            test.done();
        },
        function timeout() {
            casper.capture(screens + 'open-cta-fail.png');
            test.fail('Top comments not loaded in Open CTA');
        });
});

casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get('xunit') + 'open.xml');
});