define([
    'common/utils/detect',
    'common/utils/config',
    'common/utils/mediator',
    'common/modules/loyalty/save-for-later'
], function(
    detect,
    config,
    mediator,
    SaveForLater
) {

    return function() {
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
            var isFront = /Network Front|Section/.test(config.page.contentType),
                isDesktop = detect.getBreakpoint() === 'desktop' || detect.getBreakpoint() === 'wide';

            var canRun = !isFront && isDesktop;
            console.log("++ Can I Run this:" + canRun + " Front: " + !isFront + " Desktop: " + isDesktop + "B " + detect.getBreakpoint());
            return canRun;                                                                          1
        };

        this.variants = [
            {
                id: 'variant',
                test: function () {
                    console.log("+++ Saved For Later switched on");
                    mediator.on("module:identity:api:loaded", function() {
                        console.log("+++ Identity loaded");
                        var saveForLater = new SaveForLater();
                        saveForLater.init();
                    });
                }
            }
        ];
    }
});
