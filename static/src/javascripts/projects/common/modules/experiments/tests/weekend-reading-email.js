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
        this.expiry = '2016-10-31';
        this.author = 'Kate Whalen';
        this.description = '';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Trial two different email formats to compare CTO rates';
        this.audienceCriteria = 'All users who visit the Weekend Reading page';
        this.dataLinkNames = '';
        this.idealOutcome = 'Users open and click-through on the Weekend Reading email';

        this.canRun = function () {
            return config.page.contentType === 'survey';
        };

        function passRefererParam(emailForm) {
            var referrerInput = qwery('.js-email-sub__referrer-input')[0];
            var referrer = window.location.search.replace('?', '');
            if (referrer) {
                emailForm.setAttribute('data-link-name', 'referrer-' + referrer);
                referrerInput.setAttribute('value', referrer);
            }
        }

        function updateSignupForm(emailListID) {
            var emailListInput = qwery('.js-email-sub__listid-input')[0];
            var emailForm = qwery('.js-email-sub__form')[0];
            emailForm.setAttribute('data-email-list-id', emailListID);
            emailListInput.setAttribute('value', emailListID);
            passRefererParam(emailForm);
        }

        this.variants = [
            {
                id: 'control',
                test: function () {
                    var emailListID = 3744; // Article version
                    updateSignupForm(emailListID);
                }
            },
            {
                id: 'variant',
                test: function () {
                    var emailListID = 3743; // Minute version
                    updateSignupForm(emailListID);
                }
            }
        ];
    };
});
