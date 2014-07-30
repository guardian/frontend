define([
    'common/utils/config',
    'common/modules/onward/geo-most-popular'
    ], function(
        config,
        GeoMostPopular
    ) {
    return function() {

        this.id = 'RightMostPopularText';
        this.start = '2014-07-30';
        this.expiry = '2014-08-12';
        this.author = 'Nathaniel Bennett';
        this.description = 'Displays right most popular items as two lines of text';
        this.audience = 0.2;
        this.audienceOffset = 0.1;
        this.successMeasure = 'Increased CTR on component';
        this.audienceCriteria = 'Everyone';
        this.dataLinkNames = 'referred-content';
        this.idealOutcome = 'Higher click-through rate on most popular component for users in the test variant.';

        this.canRun = function () { return config.page.contentType === 'Article'; };

        this.variants = [
            {
                id: 'control',
                test: function () {}
            },
            {
                id: 'two-line-most-popular',
                test: function () {
                    GeoMostPopular.hideThumbnail();
                }
            }
        ];
    };
});