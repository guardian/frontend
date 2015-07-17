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
        this.id = 'SignedOutSaveForLater';
        this.start = '2015-04-09';
        this.expiry = '2015-09-31';
        this.author = 'Nathaniel Bennett';
        this.description = 'Internal test of save for later functionality';
        this.audience = 0.2;
        this.audienceOffset = 0;
        this.successMeasure = 'More user registrations';
        this.audienceCriteria = '';
        this.dataLinkNames = '';
        this.idealOutcome = '';
        this.showForSensitive = false;

        this.canRun = function () {
            return !Id.isUserLoggedIn();
        };

        this.variants = [
            {
                id: 'control',
                test: function () {}
            },
            {
                id: 'variant',
                test: function () {
                    console.log("Variant");
                    var saveForLater = new SaveForLater();
                    saveForLater.init(true);
                }
            }
        ];
    };
});
