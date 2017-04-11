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
        this.id = 'EditorialEmailVariants';
        this.start = '2016-12-01';
        this.expiry = '2017-05-30';
        this.author = 'Kate Whalen';
        this.description = 'Using the wonderful frontend AB testing framework to AB test emails, since the AB function in ExactTarget re-randomises all recipients on each send, and we need users to receive their variant for several weeks. This test will ensure users are added to the corresponding email list (listId) in ExactTarget';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'We can trial two different email formats to fairly compare their CTO rates';
        this.audienceCriteria = 'All users who visit the email sign up page';
        this.dataLinkNames = '';
        this.idealOutcome = 'Similar quantity of users in each list in ExactTarget';

        var FLYERURL = 'info/ng-interactive/2016/dec/07/sign-up-for-the-flyer';

        this.canRun = function () {
          return (config.page.contentId === FLYERURL ||
            config.page.pageId === '/email-newsletters');
        };

        function updateExampleUrl(exampleUrl) {
          return fastdomPromise.write(function () {
            var example = $('.js-email-example')[0];
            example.setAttribute('href', exampleUrl);
          });
        }

        function enhanceWebView(emailListID) {
          var emailForm = $('.js-email-sub__iframe')[0];
          emailForm.setAttribute('src', 'https://www.theguardian.com/email/form/plaintone/' + emailListID);
        }

        // Runs the test on https://www.theguardian.com/email-newsletters
        function updateNewslettersPage(emailListID) {
          return fastdomPromise.write(function () {
            var flyerInput = $('input[value="2211"]')[0];
            var flyerButton = $('button[value="2211"]')[0];
            flyerInput.setAttribute('value', emailListID);
            flyerButton.setAttribute('value', emailListID);
          });
        }

        function runTheTest(emailListID, exampleUrl) {
          if (config.page.contentId === FLYERURL) {
            enhanceWebView(emailListID);
            updateExampleUrl(exampleUrl);
          } else {
            updateNewslettersPage(emailListID);
          }
        }

        this.variants = [
            {
                id: 'The-Flyer-Cards',
                test: function () {
                    var emailListID = 3806;
                    var exampleUrl = 'https://www.theguardian.com/email/the-flyer?format=email';
                    runTheTest(emailListID, exampleUrl);
                }
            },
            {
                id: 'The-Flyer-Connected',
                test: function () {
                    var emailListID = 3807;
                    var exampleUrl = 'https://www.theguardian.com/email/the-flyer?format=email-connected';
                    runTheTest(emailListID, exampleUrl);
                }
            }
        ];
    };
});
