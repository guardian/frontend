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
    return function (props) {
        this.id = props['id'];
        this.start = props['start'];
        this.expiry = props['end'];
        this.author = props['author'];
        this.audienceOffset = props['audienceOffset'];
        this.audience = props['audience'];

        this.description = 'Using the wonderful frontend AB testing framework to AB test emails, since the AB ' +
            'function in ExactTarget re-randomises all recipients on each send, and we need users to receive their ' +
            'variant for several weeks. This test will ensure users are added to the corresponding email list ' +
            '(listId) in ExactTarget';
        this.successMeasure = 'We can trial different email formats to fairly compare their CTO rates';
        this.audienceCriteria = 'All users who see an email signup box';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        var SIGNUP_URL = props['signupPage'];
        var CANONICAL_LIST_ID = props['canonicalListId'];

        this.canRun = function () {
            return config.page.contentId === SIGNUP_URL || config.page.pageId === '/email-newsletters';
        };

        this.variants = props['testIds'].map(function(variant) {
            return {
                id: variant['variantId'],
                test: function () {
                    if (config.page.contentId === SIGNUP_URL) {
                        enhanceWebView(variant['listId']);
                    } else {
                        updateNewslettersPage(variant['listId']);
                    }
                }
            };
        });

        function enhanceWebView(emailListID) {
            var emailForm = $('.js-email-sub__iframe')[0];
            emailForm.setAttribute('src', 'https://www.theguardian.com/email/form/plaintone/' + emailListID);
        }

        function updateNewslettersPage(emailListId) {
            return fastdomPromise.write(function () {
                var input = $('input[value="' + CANONICAL_LIST_ID + '"]')[0];
                var button = $('button[value="' + CANONICAL_LIST_ID + '"]')[0];
                input.setAttribute('value', emailListId);
                button.setAttribute('value', emailListId);
            });
        }
    };
});
