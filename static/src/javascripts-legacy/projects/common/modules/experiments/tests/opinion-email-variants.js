define([
    'fastdom',
    'qwery',
    'lib/$',
    'lib/config',
    'lib/fastdom-promise'
], function (
    fastdom,
    qwery,
    $,
    config,
    fastdomPromise
) {
    return function () {
        this.id = 'OpinionEmailVariants';
        this.start = '2017-01-12';
        this.expiry = '2017-06-19';
        this.author = 'David Furey';
        this.description = 'Using the wonderful frontend AB testing framework to AB test emails, since the AB ' +
            'function in ExactTarget re-randomises all recipients on each send, and we need users to receive their ' +
            'variant for several weeks. This test will ensure users are added to the corresponding email list ' +
            '(listId) in ExactTarget';
        this.audience = 0.2;
        this.audienceOffset = 0;
        this.successMeasure = 'We can trial two different email formats to fairly compare their CTO rates';
        this.audienceCriteria = 'All users who visit the email sign up page';
        this.dataLinkNames = '';
        this.idealOutcome = '90% of users in new format list, 10% in the other list';

        var OPINION_URL = 'info/ng-interactive/2017/jan/12/sign-up-for-the-guardian-opinion-email';

        this.canRun = function () {
            return (config.page.contentId === OPINION_URL ||
            config.page.pageId === '/email-newsletters');
        };

        function enhanceWebView(emailListID) {
            var emailForm = $('.js-email-sub__iframe')[0];
            emailForm.setAttribute('src', 'https://www.theguardian.com/email/form/plaintone/' + emailListID);
        }

        // Runs the test on https://www.theguardian.com/email-newsletters
        function updateNewslettersPage(emailListID) {
            return fastdomPromise.write(function () {
                var input = $('input[value="3811"]')[0];
                var button = $('button[value="3811"]')[0];
                input.setAttribute('value', emailListID);
                button.setAttribute('value', emailListID);
            });
        }

        function runTheTest(emailListID) {
            if (config.page.contentId === OPINION_URL) {
                enhanceWebView(emailListID);
            } else {
                updateNewslettersPage(emailListID);
            }
        }

        this.variants = [
            {
                id: 'Opinion-UK-Connected',
                test: function () {
                    runTheTest(3811);
                }
            },
            {
                id: 'Opinion-UK-Legacy',
                test: function () {
                    runTheTest(3814);
                }
            }
        ];
    };
});
