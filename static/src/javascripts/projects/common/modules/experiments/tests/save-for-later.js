define([
    'bonzo',
    'qwery',
    'fastdom',
    'common/utils/detect',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/template',
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
                    var userHasSavedArticles = !!resp.savedArticles;

                    if (userHasSavedArticles) {
                        init();
                    }
                });
            });
        };
    };
});
