define([
    'lodash/utilities/noop',
    'common/modules/identity/api'
], function (
    noop,
    Id
) {
    return function () {

        this.id = 'EmailSignupMarketingCheckboxV2';
        this.start = '2016-03-09';
        this.expiry = '2016-03-29';
        this.author = 'Gareth Trufitt';
        this.description = 'Testing how the marketing checkbox affects engagement and sign-ups';
        this.audience = 0.15;
        this.audienceOffset = 0.3;
        this.successMeasure = 'Sign-ups to email when the checkbox is shown and the difference made to checked/un-checked checkbox';
        this.audienceCriteria = 'All users who see the email sign-up';
        this.dataLinkNames = '';
        this.idealOutcome = 'The marketing checkbox doesn\'t reduce the amount of people that sign-up';

        this.canRun = function () {
            return !Id.isUserLoggedIn();
        };

        this.variants = [
            {
                id: 'marketing-default-unchecked',
                test: noop
            },
            {
                id: 'marketing-default-checked',
                test: noop
            },
            {
                id: 'control',
                test: noop
            }
        ];
    };
});
