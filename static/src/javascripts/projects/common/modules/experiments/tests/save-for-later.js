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
    'text!common/views/identity/saved-for-later-profile-link.html'
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
    profileLinkTmp
) {

    return function () {
        this.id = 'SaveForLater';
        this.start = '2015-04-09';
        this.expiry = '2015-07-09';
        this.author = 'Nathaniel Bennett';
        this.description = 'Internal test of save for later functionality';
        this.audience = 0.0;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = 'Interal only - we opt in';
        this.dataLinkNames = '';
        this.idealOutcome = '';
        this.showForSensitive = false;

        this.canRun = function () {
            return Id.isUserLoggedIn();
        };

        this.variants = [
            {
                id: 'variant',
                test: function () {
                    mediator.on('module:identity:api:loaded', function () {
                        var saveForLater = new SaveForLater();
                        saveForLater.init();
                    });

                    mediator.on('modules:profilenav:loaded', function () {
                        var popup = qwery('.popup--profile')[0];
                        fastdom.write(function () {
                            bonzo(popup).prepend(bonzo.create(
                                template(profileLinkTmp.replace(/^\s+|\s+$/gm, ''), {
                                    idUrl: config.page.idUrl
                                })
                            ));
                        });
                    });

                }
            }
        ];
    };
});
