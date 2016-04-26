define([
    'common/utils/config'
], function (
    config
) {
    return function () {

        this.id = 'VideoSeriesPage';
        this.start = '2016-04-27';
        this.expiry = '2016-05-04';
        this.author = 'James Gorrie';
        this.description = 'New video series page (initial numbers test)';
        this.audience = 0.5;
        this.audienceOffset = 0.5;
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
                id: 'variant',
                test: function () {}
            }
        ];
    };
});
