define([
    'common/utils/config'
], function (
    config
) {
    return function () {
        this.id = 'VideoTeaser';
        this.start = '2016-06-07';
        this.expiry = '2016-06-17';
        this.author = 'Akash Askoolum';
        this.description = 'Test if video teasing leads to more plays';
        this.showForSensitive = true;
        this.audience = 0.18;
        this.audienceOffset = 0.12;
        this.successMeasure = '';
        this.audienceCriteria = 'Videos not in a carousel';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return config.page.isFront
                && document.getElementsByClassName('gu-media-wrapper--video').length > 0
                && config.page.pageId !== 'video';
        };

        this.variants = [
            {
                id: 'control',
                test: function () {}
            },
            {
                id: 'variant',
                test: function () {}
            }
        ];
    };
});
