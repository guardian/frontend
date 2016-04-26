define([
    'common/utils/config'
], function (
    config
) {
    return function () {

        this.id = 'VideoSeriesPage';
        this.start = '2016-04-25';
        this.expiry = '2016-05-03';
        this.author = 'James Gorrie';
        this.description = 'In series related content';
        this.audience = 1.0;
        this.audienceOffset = 0.0;
        this.successMeasure = '';
        this.showForSensitive = true;
        this.audienceCriteria = '';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return config.page.contentType === 'Video' && config.page.seriesTags;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {}
            },
            {
                id: 'inSeries',
                test: function () {}
            }
        ];
    };
});
