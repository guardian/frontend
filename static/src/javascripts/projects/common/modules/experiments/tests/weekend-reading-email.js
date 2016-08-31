define([
    'bean',
    'reqwest',
    'fastdom',
    'qwery',
    'common/utils/$',
    'common/utils/config'
], function (
    bean,
    reqwest,
    fastdom,
    qwery,
    $,
    config
) {
    return function () {
        this.id = 'WeekendReadingEmail';
        this.start = '2016-08-23';
        this.expiry = '2016-09-23';
        this.author = 'Kate Whalen';
        this.description = '';
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = 'Trial two different email formats to compare CTO rates';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'Users open and click-through on the Weekend Reading email';

        this.canRun = function () {
            return config.page.contentType === 'survey';
        };

        function passRefererParam() {
            var campaignCodeInput = qwery('.js-email-sub__campaignCode-input')[0];
            var refererCode = window.location.search.replace('?', '');
            if (refererCode) {
                campaignCodeInput.setAttribute('value', refererCode);
            }
        }

        function updateSignupForm(emailListID) {
            var emailListInput = qwery('.js-email-sub__listid-input')[0];
            emailListInput.setAttribute('value', emailListID);
            passRefererParam();
        }

        this.variants = [
            {
                id: 'control',
                test: function () {
                    var emailListID = 3742;
                    updateSignupForm(emailListID);
                }
            },
            {
                id: 'variant',
                test: function () {
                    var emailListID = 3743;
                    updateSignupForm(emailListID);
                }
            }
        ];
    };
});
