/**
 * Defines a test to a Membership registration variant with a Standfirst.
 *
 * Code for recording test events is in the new identity-frontend repo.
 *
 * @see https://github.com/guardian/identity-frontend
 * @see https://profile.theguardian.com/register?clientId=members&mvt_registermembershipstandfirst=a
 */
define([], function () {

    return function () {

        this.id = 'IdentityRegisterMembershipStandfirst';
        this.start = '2016-02-25';
        this.expiry = '2016-04-01';
        this.author = 'James Pamplin';
        this.description = 'Membership registration page variant for Identity';
        this.audience = 0.5;
        this.audienceOffset = 0;
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
