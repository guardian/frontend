define([
    'bean',
    'reqwest',
    'fastdom',
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/modules/email/email'
], function (
    bean,
    reqwest,
    fastdom,
    qwery,
    $,
    config,
    email
) {
    return function () {
        this.id = 'WeekendReadingEmail';
        this.start = '2016-08-23';
        this.expiry = '2016-09-23';
        this.author = 'Kate Whalen';
        this.description = '';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Trial two different email formats to compare CTO rates';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'Users open and click-through on the Weekend Reading email';

        this.canRun = function () {
            return config.page.contentType === 'survey';
        };

        var $buttonEl = qwery('.js-email-sub__submit-input')[0];
        var $emailListInput = qwery('.js-email-sub__listid-input')[0];

        function updateSignupForm(emailListID) {
            // $buttonEl.setAttribute('type', 'button');
            $emailListInput.setAttribute('value', emailListID);
            // bean.on($buttonEl, 'click', reqwestEmailSignup);
        }

        function generateFormQueryString() {
            var userEmail = ($('.js-email-sub__form')[0].elements.email.value).toString();
            var listId = ($('.js-email-sub__form')[0].elements.listId.value).toString();
            return 'email=' + encodeURIComponent(userEmail) + '&' + 'listId=' + encodeURIComponent(listId);
        }

        function reqwestEmailSignup(buttonEl) {
                var formQueryString = generateFormQueryString();
                reqwest({
                    url: '/email',
                    method: 'POST',
                    data: formQueryString,
                    error: function () {
                        renderErrorMessage(buttonEl);
                    },
                    success: function () {
                        // store a cookie
                        // update the display
                    }
                });
            }

        // function success(complete) {
        //     bean.on(qwery('.js-email-sub__submit-input')[0], 'click', complete);
        // }

        this.variants = [
            {
                id: 'control',
                test: function () {
                    var emailListID = 123;
                    updateSignupForm(emailListID);
                }
            },
            {
                id: 'variant',
                test: function () {
                    var emailListID = 456;
                    updateSignupForm(emailListID);
                }
            }
        ];
    };
});
