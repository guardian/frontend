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
            return (config.page.webTitle.toLowerCase() === 'sign up for weekend reading');
        };

        function updateExampleUrl(exampleUrl) {
          return fastdomPromise.write(function () {
            var example = $('.js-email-example')[0];
            example.setAttribute('href', exampleUrl);
          });
        }

        // loads the correct iframe if we can...
        function enhanceWebView(emailListID) {
          var insertionPoint = $('.js-email-sub__iframe')[0];
          $(insertionPoint).addClass('is-hidden');
          var emailForm = $.create(
                '<iframe src="/email/form/plaintone/' + emailListID +
                '" height="60px" width="100%" scrolling="no" frameborder="0" seamless' + 'class="iframed--overflow-hidden js-email-sub__iframe js-email-sub__iframe--article">' + '</iframe>'
              );
          $(emailForm).insertAfter(insertionPoint);
        }

        this.variants = [
            {
                id: 'The-Flyer-Cards',
                test: function () {
                    var emailListID = 3806;
                    var exampleUrl = 'https://www.theguardian.com/email/the-flyer?format=email';
                    enhanceWebView(emailListID);
                    updateExampleUrl(exampleUrl);
                }
            },
            {
                id: 'The-Flyer-Connected',
                test: function () {
                    var emailListID = 3807;
                    var exampleUrl = 'https://www.theguardian.com/email/the-flyer?format=email-connected';
                    enhanceWebView(emailListID);
                    updateExampleUrl(exampleUrl);
                }
            }
        ];
    };
});
