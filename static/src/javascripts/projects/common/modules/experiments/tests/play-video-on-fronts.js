define([
    'qwery',
    'common/utils/config'
], function (
    qwery,
    config
) {
    return function () {
        this.id = 'PlayVideoOnFronts';
        this.start = '2016-05-18';
        this.expiry = '2016-05-25';
        this.author = 'James Gorrie';
        this.description = 'Test if autoplaying on fronts is bad.';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = 'Fronts that have cards with articles that have video as their main media';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            // Only videos that are links to video pages have data-embed-paths
            return config.page.isFront && qwery('video:not([data-embed-path])').length > 0;
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
