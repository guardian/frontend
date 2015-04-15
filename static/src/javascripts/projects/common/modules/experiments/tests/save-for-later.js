define([
    'common/utils/detect',
    'common/utils/config',
    'common/utils/mediator',
    'common/modules/loyalty/save-for-later'
], function (
    detect,
    config,
    mediator,
    SaveForLater
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

        this.canRun = function () {
            var isNotContent = /Network Front|Section/.test(config.page.contentType),
                isDesktop = detect.isBreakpoint({ min: 'desktop'});

            return !isNotContent && isDesktop;
        };

        this.variants = [
            {
                id: 'variant',
                test: function () {
                    mediator.on('module:identity:api:loaded', function () {
                        var saveForLater = new SaveForLater();
                        saveForLater.init();
                    });
                }
            }
        ];
    };
});
