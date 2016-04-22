define([
    'common/utils/config'
], function (
    config
) {
    return function () {

        this.id = 'VideoSeries';
        this.start = '2016-04-21';
        this.expiry = '2016-04-25';
        this.author = 'James Gorrie';
        this.description = 'New video series page (initial numbers test)';
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
                id: 'test1',
                test: function () {}
            },
            {
                id: 'test2',
                test: function () {}
            }
        ];
    };
});
