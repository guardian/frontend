define([
    "modules/onward/sequence",
    "modules/onward/right-ear",
    'utils/mediator'
], function(
    sequence,
    RightEar,
    mediator
    ) {

    var rendered = false;

    return function() {

        this.id = 'OnwardIntrusive';
        this.expiry = '2013-12-30';
        this.audience = 0.25;
        this.audienceOffset = 0.3;
        this.description = 'Test whether onward components increase page views per session';
        this.canRun = function(config) {
            return config.page.contentType === 'Article';
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
