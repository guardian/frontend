/**
 * Defines test to record usage of new sign in variant for Identity.
 *
 * Code for recording test events is in the new identity-frontend repo, and will
 * run automatically when users are routed to the new service.
 *
 * @see https://github.com/guardian/identity-frontend
 */
define([], function () {

    return function () {

        this.id = 'IdentitySignInV2';
        this.start = '2015-12-15';
        this.expiry = '2016-03-01';
        this.author = 'James Pamplin';
        this.description = 'New sign in page variants for Identity';
        this.audience = 0.2;
        this.audienceOffset = 0.5;
        this.successMeasure = 'More people sign in';
        this.audienceCriteria = 'everyone';
        this.dataLinkNames = '';
        this.idealOutcome = 'More people sign in';

        this.canRun = function () {
            // Test data will be recorded automatically when run on new identity-frontend service.
            return false;
        };

        this.variants = [
            {
                id: 'A',
                test: function () {}
            },
            {
                id: 'B',
                test: function () {}
            }
        ];

    };

});
