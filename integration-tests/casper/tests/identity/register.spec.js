/* global document */
'use strict';

/**
 * Signin page tests
 */

 casper.test.setUp(function() {
    casper.start(idHost +'register?view=mobile');
});


 casper.test.begin("Register page loads and key elements are present", function(test) {
    casper.then(function testKeyEventsToggle() {
        casper.waitForSelector(".identity-wrapper", function() {
            test.assertTitle('Register', 'expected: register form components');
            test.assertVisible('.social-signin', 'expected to see social sign in buttons on register page');
            test.done();

        }, function timeout(){
            casper.capture(screens + 'register_page_failure.png');
            test.fail("Failed to find elements on register page");
        });
    });
});


casper.run(function() {
    this.test.renderResults(true, 0, this.cli.get('xunit') + 'identity.xml');
});