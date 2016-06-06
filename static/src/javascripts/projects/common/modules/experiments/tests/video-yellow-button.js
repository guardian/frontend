define([
    'common/utils/config'
], function (
    config
) {
    return function () {
        this.id = 'VideoYellowButton';
        this.start = '2016-06-07';
        this.expiry = '2016-06-14';
        this.author = 'Akash Askoolum';
        this.description = 'Test if a yellow play button increases starts';
        this.showForSensitive = true;
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = '';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return config.page.isFront
                && document.getElementsByClassName('gu-media-wrapper--video').length > 0;
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
