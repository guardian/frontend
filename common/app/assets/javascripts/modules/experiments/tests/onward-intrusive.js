define([
    "common/modules/onward/sequence",
    "common/modules/onward/right-ear",
    'common/utils/mediator',
    'common/utils/detect'
], function(
    sequence,
    RightEar,
    mediator,
    detect
    ) {

    var rendered = false;

    return function() {

        this.id = 'OnwardIntrusive';
        this.expiry = '2013-12-30';
        this.audience = 0.25;
        this.audienceOffset = 0.3;
        this.description = 'Test whether onward components increase page views per session';
        this.canRun = function(config) {
            return detect.getBreakpoint() !== 'mobile' && detect.hasCSSSupport('position', 'fixed', true) &&
            config.page.contentType === 'Article';
        };
        this.variants = [
            {
                id: 'RightEar',
                test: function (context, config) {

                    mediator.on('modules:sequence:loaded', function(currentSequence) {
                        if (currentSequence && currentSequence.items.length > 0 && !rendered) {
                            var rightEar = new RightEar(currentSequence.items, {});
                            rightEar.render();
                            rendered = true;
                        }
                    });

                    sequence.init('/' + config.page.pageId);
                }
            }
        ];
    };
});
