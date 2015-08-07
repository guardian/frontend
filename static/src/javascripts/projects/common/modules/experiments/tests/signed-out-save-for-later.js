define([
    'bonzo',
    'qwery',
    'fastdom',
    'common/utils/detect',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/template',
    'common/modules/identity/api',
    'common/modules/save-for-later'
], function (
    bonzo,
    qwery,
    fastdom,
    detect,
    config,
    mediator,
    template,
    Id,
    SaveForLater
) {

    return function () {
        this.id = 'SignedOutSaveForLaterAug';
        this.start = '2015-08-02';
        this.expiry = '2015-08-31';
        this.author = 'Nathaniel Bennett';
        this.description = 'Allow signed out users to save articles via signin';
        this.audience = 0.1;
        this.audienceOffset = 0;
        this.successMeasure = 'More user registrations';
        this.audienceCriteria = '';
        this.dataLinkNames = '';
        this.idealOutcome = '';
        this.showForSensitive = false;

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {}
            },
            {
                id: 'variant',
                test: function () {
                    if (config.switches.saveForLater && !Id.isUserLoggedIn()) {
                        var saveForLater = new SaveForLater();
                        saveForLater.init(true);
                    }
                }
            }
        ];
    };
});
