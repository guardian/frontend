/* global document */
'use strict';

/**
 * Signin page tests
 */

 casper.test.setUp(function() {
    casper.start(idHost +'signin?view=mobile');
});


 casper.test.begin("Signin page loads and key elements are present", function(test) {
    casper.then(function testKeyEventsToggle() {
        casper.waitForSelector(".identity-wrapper", function() {
            test.assertTitle('Sign in', 'expected: Sign in');
            test.assertVisible('.social-signin', 'expected to see social sign in buttons');
            test.done();

        }, function timeout(){
            casper.capture(screens + 'signin_page_failure.png');
            test.fail("Failed to find elements on signin page");
        });
    });
});


casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get('xunit') + 'identity.xml');
});