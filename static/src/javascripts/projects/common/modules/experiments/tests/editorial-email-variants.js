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

        // use this if we are using the form, form will still work with no-JS
        function updateSignupForm(emailListID) {
            var emailListInput = qwery('.js-email-sub__listid-input')[0];
            var emailForm = qwery('.js-email-sub__form')[0];
            emailForm.setAttribute('data-email-list-id', emailListID);
            emailListInput.setAttribute('value', emailListID);
            passRefererParam(emailForm);
        }

        // loads the correct iframe if we can...
        function enhanceWebView(emailListID) {
          return fastdomPromise.write(function () {
              var insertionPoint = $('.js-email-sub__form')[0];
              $(insertionPoint).addClass('is-hidden');
              var emailForm = $.create(
                    '<iframe src="/email/form/plaintone/' + emailListID +
                    '" height="60px" width="100%" scrolling="no" frameborder="0" seamless' + 'class="iframed--overflow-hidden js-email-sub__iframe js-email-sub__iframe--article">' + '</iframe>'
                  );
              $(emailForm).insertAfter(insertionPoint);
          });
        }

        this.variants = [
            {
                id: 'card',
                test: function () {
                    var emailListID = 3743;
                    enhanceWebView(emailListID);
                }
            },
            {
                id: 'connected',
                test: function () {
                    var emailListID = 3744;
                    enhanceWebView(emailListID);
                }
            }
        ];
    };
});
