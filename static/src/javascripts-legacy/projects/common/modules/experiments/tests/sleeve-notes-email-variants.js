define([
    'bean',
    'fastdom',
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/utils/fastdom-promise'
], function (
    bean,
    fastdom,
    qwery,
    $,
    config,
    fastdomPromise
) {
    return function () {
        this.id = 'SleevenotesEmailVariants';
        this.start = '2017-03-03';
        this.expiry = '2017-03-31';
        this.author = 'Leigh-Anne Mathieson';
        this.description = 'Using the wonderful frontend AB testing framework to AB test emails, since the AB ' +
            'function in ExactTarget re-randomises all recipients on each send, and we need users to receive their ' +
            'variant for several weeks. This test will ensure users are added to the corresponding email list ' +
            '(listId) in ExactTarget';
        this.audience = 0.6;
        this.audienceOffset = 0;
        this.successMeasure = 'We can trial two different email formats to fairly compare their CTO rates';
        this.audienceCriteria = 'All users who visit the email sign up page';
        this.dataLinkNames = '';
        this.idealOutcome = '90% of users in new format list, 10% in the other list';

        var SLEEVENOTES_URL = '/info/ng-interactive/2017/feb/23/sign-up-for-the-sleeve-notes-email';
        var newSleevenotesListId = 3834;
        var controlListId = 3835;

        this.canRun = function () {
            return (config.page.contentId === SLEEVENOTES_URL ||
            config.page.pageId === '/email-newsletters');
        };

        function enhanceWebView(emailListID) {
            var emailForm = $('.js-email-sub__iframe')[0];
            emailForm.setAttribute('src', 'https://www.theguardian.com/email/form/plaintone/' + emailListID);
        }

        // Runs the test on https://www.theguardian.com/email-newsletters
        function updateNewslettersPage(emailListID) {

            return fastdomPromise.write(function () {
                var input = $('input[value=${newSleevenotesListId.toString()}]')[0];
                var button = $('button[value=${newSleevenotesListId.toString()}]')[0];
                input.setAttribute('value', emailListID);
                button.setAttribute('value', emailListID);
            });
        }

        function updateSignupPage(emailListID) {
            if (config.page.contentId === SLEEVENOTES_URL) {
                enhanceWebView(emailListID);
            } else {
                updateNewslettersPage(emailListID);
            }
        }

        this.variants = [
            {
                id: 'Sleevenotes-UK-Connected',
                test: function () {
                    updateSignupPage(newSleevenotesListId);
                }
            },
            {
                id: 'Sleevenotes-UK-Legacy',
                test: function () {
                    updateSignupPage(controlListId);
                }
            }
        ];
    };
});
