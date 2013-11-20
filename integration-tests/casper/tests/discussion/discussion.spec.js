/* global document */
'use strict';

/**
 *
 * Discussion feature tests 
 *
 **/

casper.test.setUp(function() {
    casper.start(host + '/science/grrlscientist/2012/aug/07/3?view=mobile');
});

/**
 *   Scenario: Read top level comments
 *     Given I am on an article with comments
 *     Then I can see the comments
 * 
 **/
// Check the correct login/out buttons are present
casper.test.begin('Read top level comments', function(test) {
    casper.waitForSelector('.d-discussion', function then() {
        test.assertExists('.d-discussion');
        test.assertVisible('.d-discussion');
        test.done();
    }, function timeout() {
        casper.capture('discussion-fail.png');
        test.fail('Comments failed to load');
    });
});


casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get('xunit') + 'discussion.xml');
});
