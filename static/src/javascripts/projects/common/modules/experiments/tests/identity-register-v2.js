/**
 * Defines a test to record usage of user registration variant for Identity.
 *
 * Code for recording test events is in the new identity-frontend repo, and will
 * run automatically when users are routed to the new service.
 *
 * Audience offsets unused, user segmenting controlled by Varnish director in Fastly.
 *
 * @see https://github.com/guardian/identity-frontend
 */
define([], function () {

    return function () {

        this.id = 'IdentityRegisterV2';
        this.start = '2016-01-27';
        this.expiry = '2016-03-01';
        this.author = 'James Pamplin';
        this.description = 'New user registration page variant for Identity';
        this.audience = 0.2;
        this.audienceOffset = 0.5;
        this.successMeasure = 'More people register';
        this.audienceCriteria = 'everyone';
        this.dataLinkNames = '';
        this.idealOutcome = 'More people register';

        this.canRun = function () {
            // Test data will be recorded automatically when run on new identity-frontend service.
            return false;
        };

        this.variants = [
            {
                id: 'A',
                test: function () {}
            }
        ];

    };

});
