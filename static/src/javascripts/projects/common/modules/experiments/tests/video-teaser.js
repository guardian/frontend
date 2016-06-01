define([
    'common/utils/$',
    'common/utils/config'
], function (
    $,
    config
) {
    return function () {
        this.id = 'VideoTeaser';
        this.start = '2016-05-23';
        this.expiry = '2016-06-01';
        this.author = 'Akash Askoolum';
        this.description = 'Test if video teasing leads to more plays';
        this.showForSensitive = true;
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = 'Videos not in a carousel';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return config.page.isFront
                && $('.gu-media-wrapper--video').length > 0
                && config.page.pageId !== 'video';
        };

        this.variants = [
            {
                id: 'baseline1',
                test: function () {}
            },
            {
                id: 'baseline2',
                test: function () {}
            }
        ];
    };
});
