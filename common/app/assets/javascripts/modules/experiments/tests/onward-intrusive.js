define([
    "modules/onward/sequence",
    "modules/onward/right-ear"
], function(
    sequence,
    RightEar
    ) {

    return function() {

        this.id = 'OnwardIntrusive';
        this.expiry = '2013-12-16';
        this.audience = 0.25;
        this.audienceOffset = 0.3;
        this.description = 'Test whether onward components increase page views per session';
        this.canRun = function(config) {
            return config.page.contentType === 'Article';
        };
        this.variants = [
            {
                id: 'RightEar',
                test: function (context) {
                    sequence.init();
                    var currentSequence = sequence.getSequence();
                    if (currentSequence && currentSequence.items.length > 0) {
                        var rightEar = new RightEar(currentSequence.items, {});
                        rightEar.render();
                    }
                }
            }
        ];
    };
});
