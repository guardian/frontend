define([
    'bean',
    'fastdom',
    'qwery',
    'common/utils/$',
    'common/utils/config'
], function (
    bean,
    fastdom,
    qwery,
    $,
    config
) {
    return function () {
        this.id = 'EditorialEmailVariants';
        this.start = '2016-12-01';
        this.expiry = '2017-01-01';
        this.author = 'Kate Whalen';
        this.description = 'Using the wonderful frontend AB testing framework to AB test emails, since the AB function in ExactTarget re-randomises all recipients on each send, and we need users to receive their variant for several weeks. This test will ensure users are added to the corresponding email list (listId) in ExactTarget';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'We can trial two different email formats to fairly compare their CTO rates';
        this.audienceCriteria = 'All users who visit the email sign up page';
        this.dataLinkNames = '';
        this.idealOutcome = 'Similar quantity of users in each list in ExactTarget';

        this.canRun = function () {
            return (config.page.seriesId.toLowerCase() === 'info/series/newsletter-sign-ups');
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
                    var emailListID = 1234;
                    updateSignupForm(emailListID);
                }
            },
            {
                id: 'variant',
                test: function () {
                    var emailListID = 5678;
                    updateSignupForm(emailListID);
                }
            }
        ];
    };
});
