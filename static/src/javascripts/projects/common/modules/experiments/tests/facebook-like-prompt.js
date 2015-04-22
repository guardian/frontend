define([
    'common/utils/$',
    'common/utils/_',
    'common/utils/detect',
    'common/utils/template',
    'common/modules/ui/message',
    'common/utils/config',
    'common/utils/ajax-promise',
    'common/utils/mediator'
], function (
    $,
    _,
    detect,
    template,
    Message,
    config,
    ajax,
    mediator
) {

    return function () {
        this.id = 'FacebookLikePrompt';
        this.start = '2015-04-17';
        this.expiry = '2015-05-17';
        this.author = 'Oliver Ash';
        this.description = 'Shows a prompt (site message) asking the user to like the Guardian on Facebook.';
        this.audience = 0.005;
        this.audienceOffset = 0;
        this.successMeasure = 'Our Facebook likes increase across all editions';
        this.audienceCriteria = 'All users';
        // We use the FB SDK to listen to like events
        this.dataLinkNames = '';
        this.idealOutcome = 'We have higher traffic from Facebook, and we add these buttons permanently.';

        var usernames = {
            'UK': 'theguardian',
            'AU': 'theguardianaustralia',
            'US': 'GuardianUS'
        };
        var username = usernames[config.page.edition];

        this.canRun = function () {
            return true;
        };

        var getFacebookLikeButtonTemplate = function () {
            return '<div class="fb-like"' +
                 'data-href="https://www.facebook.com/' + username + '"' +
                 'data-layout="button"' +
                 'data-action="like"' +
                 'data-show-faces="true"' +
                 'data-share="false"></div>';
        };

        var getFacebookLikePromptProgressBarTemplate = function (edition, likes, remainingLikes, percentageComplete, options) {
            options = options || {};
            var textTarget = (edition.textTarget || edition.target.toLocaleString());
            var percentageIncomplete = 100 - percentageComplete;
            var completeLikesText = likes.toLocaleString() + ' likes';
            var incompleteLikesText = remainingLikes.toLocaleString() + ' to go';
            return template(
                '<p class="site-message__message" id="site-message__message">{{messageText}}</p>' +
                '<div class="site-message--facebook-like-prompt__like ' +
                             (options.showIncompleteLabelInsideProgressBar
                                 ? 'site-message--facebook-like-prompt__like--inside-label'
                                 : '') +
                    '">' +
                    getFacebookLikeButtonTemplate() +
                    '<div class="progress-bar" data-percentage="50%">' +
                        '<div class="progress-bar__complete"' +
                             'style="width: ' + percentageComplete + '%"' +
                             'title="' + completeLikesText + '">' + completeLikesText + '</div>' +
                        '<div class="progress-bar__incomplete"' +
                              'style="width: ' + percentageIncomplete + '%"' +
                              'title="' + incompleteLikesText + '">' +
                              (options.showIncompleteLabelInsideProgressBar
                                  ? incompleteLikesText
                                  : '') +
                        '</div>' +
                    '</div>' +
                    (!options.showIncompleteLabelInsideProgressBar
                        ? '<div class="site-message--facebook-like-prompt__incomplete-text">' +
                              '< ' + incompleteLikesText +
                          '</div>'
                        : '') +
                '</div>',
                {
                    messageText: 'Help us reach ' + textTarget + ' people: ' +
                                 '<span class="u-color-black">Like the Guardian on Facebook</span>'
                }
            );
        };

        var getLikes = function (username) {
            return ajax({ url: 'https://graph.facebook.com/' + username + '?fields=likes' })
                .then(function (response) {
                    return response.likes;
                });
        };

        var siteMessage = $('.js-site-message');
        var loadFacebookSdk = function () {
            // Render like button
            // SDK must be loaded/initialised after the like button is added

            // TODO: Why do we have to initialise twice? Test on mobile + desktop!!
            require(['js!facebook!exports=FB'], function (FB) {
                FB.init({
                    appId: config.page.fbAppId,
                    status: true, // check login status
                    cookie: true, // enable cookies to allow the server to access the session
                    xfbml: true // parse XFBML
                });

                // We can't track clicks on the iframe so we use the FB SDK to
                // track instead. We do still want a correct link name.
                FB.Event.subscribe('edge.create', function () {
                    var linkName = siteMessage.attr('data-link-name') + '| Facebook like button';
                    mediator.emit('module:clickstream:interaction', linkName);
                });
            });
        };

        var progressBarTest = function (editions, options) {
            return function () {
                var edition = editions[config.page.edition];

                getLikes(username)
                    .then(function (likes) {
                        var remainingLikes = edition.target - likes;
                        var percentageComplete = (likes / edition.target) * 100;

                        new Message('facebook-like-prompt', {
                            pinOnHide: false,
                            siteMessageCloseBtn: 'hide'
                        }).show(getFacebookLikePromptProgressBarTemplate(edition, likes, remainingLikes, percentageComplete, options));

                        loadFacebookSdk();
                    });
            };
        };

        this.variants = [
            {
                id: 'control',
                test: function () {}
            },
            {
                id: 'simple',
                test: function () {
                    new Message('facebook-like-prompt', {
                        pinOnHide: false,
                        siteMessageCloseBtn: 'hide'
                    }).show(template(
                        '<p class="site-message__message" id="site-message__message">{{messageText}}</p>' +
                        '<div class="site-message--facebook-like-prompt__like">' +
                            getFacebookLikeButtonTemplate() +
                        '</div>',
                        {
                            messageText: 'Like the Guardian on Facebook'
                        }
                    ));

                    loadFacebookSdk();
                }
            },
            {
                id: 'progress-bar--high-target',
                test: progressBarTest({
                    'UK': { target: 10000000, textTarget: '10 million' },
                    'AU': { target: 500000 },
                    'US': { target: 500000 }
                }, { showIncompleteLabelInsideProgressBar: true })
            },
            {
                id: 'progress-bar--low-target',
                test: progressBarTest({
                    'UK': { target: 5000000, textTarget: '5 million' },
                    'AU': { target: 400000 },
                    'US': { target: 300000 }
                })
            }
        ];
    };

});
