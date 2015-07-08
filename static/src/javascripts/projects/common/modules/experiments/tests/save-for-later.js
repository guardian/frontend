define([
    'bonzo',
    'qwery',
    'fastdom',
    'common/utils/detect',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/template',
    'common/modules/ui/message',
    'common/modules/identity/api',
    'common/modules/save-for-later',
    'Promise'
], function (
    bonzo,
    qwery,
    fastdom,
    detect,
    config,
    mediator,
    template,
    Message,
    Id,
    SaveForLater,
    Promise
) {

    return function () {
        this.id = 'SaveForLater';
        this.start = '2015-04-09';
        this.expiry = '2015-07-09';
        this.author = 'Nathaniel Bennett';
        this.description = 'Internal test of save for later functionality';
        this.audience = 0.2;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = 'Interal only - we opt in';
        this.dataLinkNames = '';
        this.idealOutcome = '';
        this.showForSensitive = false;

        this.canRun = function () {
            return Id.isUserLoggedIn();
        };

        var init = function () {
            var saveForLater = new SaveForLater();
            saveForLater.init();

            var templateStr =
                '<div class="site-message__message" id="site-message__message">' +
                    '<%=messageTextHeader%>' +
                    '<p class="site-message__description"><%=messageText%></p>' +
                '</div>' +
                '<ul class="site-message__actions u-unstyled">' +
                    '<li class="site-message__actions__item">' +
                        '<i class="i i-arrow-white-right"></i>' +
                        '<a href="<%=panelLink%>" target="_blank" data-link-name="read more"><%=linkText%></a>' +
                    '</li>' +
                '</ul>';

            var panelLinks = {
                mobile: 'https://m.userzoom.com/m/MSBDMTBTMjMw',
                tablet: 'https://m.userzoom.com/m/MSBDMTBTMjMw',
                desktop: 'https://s.userzoom.com/m/MSBDMTBTMjI5',
                wide: 'https://s.userzoom.com/m/MSBDMTBTMjI5'
            };

            new Message('save-for-later', {
                pinOnHide: false
            }).show(template(
                templateStr,
                {
                    panelLink: panelLinks[detect.getBreakpoint()],
                    messageTextHeader: 'Tell us about your experience using the Guardian site',
                    messageText: 'Complete a quick survey (10 min) and get involved in the development of the site.',
                    linkText: 'Open survey'
                }
            ));
        };

        this.variants = [
            {
                id: 'control',
                test: function () {}
            },
            {
                id: 'variant',
                test: function () {
                    var loadIdentityApi = new Promise(function (resolve) {
                        mediator.on('module:identity:api:loaded', resolve);
                    });

                    var loadProfileNav = new Promise(function (resolve) {
                        mediator.on('modules:profilenav:loaded', resolve);
                    });

                    Promise.all([loadIdentityApi, loadProfileNav]).then(init);

                }
            }
        ];

        this.notInTest = function () {
            // On top of the A/B test, we always want to give pre-existing SFL
            // users the web feature.
            mediator.on('module:identity:api:loaded', function () {
                Id.getSavedArticles().then(function (resp) {
                    // If the user hasn't saved articles before, ID responds
                    // 404. If they have, but now they have none, ID responds
                    // 200 with articles = [] (!!)
                    var userHasSavedArticles = !resp.savedArticles ? false : resp.savedArticles.articles.length > 0;

                    if (userHasSavedArticles) {
                        init();
                    }
                });
            });
        };
    };
});
