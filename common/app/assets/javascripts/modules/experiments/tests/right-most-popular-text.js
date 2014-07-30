define([
    'common/utils/config',
    'common/modules/onward/geo-most-popular'
    ], function(
        config,
        GeoMostPopular
    ) {
    return function() {

        this.id = 'RightMostPopularText';
        this.start = '2014-07-28';
        this.expiry = '2014-08-14';
        this.author = 'Nathaniel Bennett';
        this.description = 'Displays right most popular items as two lines of text';
        this.audience = 0.2;
        this.audienceOffset = 0.6;
        this.successMeasure = 'Increased CTR on component';
        this.audienceCriteria = 'Everyone';
        this.dataLinkNames = 'referred-content';
        this.idealOutcome = 'Higher click-through rate on most popular component for users in the test variant.';

        this.canRun = function () { return config.page.contentType === 'Article'; };

        this.variants = [
            {
                id: 'control',
                test: function () {
                    console.log("+ Most popular - control")
                }
            },
            {
                id: 'two-line-most-popular',
                test: function () {
                    console.log("+ Line most popular");
                    GeoMostPopular.hideThumbnail();
                }
            }
        ];
    };
});