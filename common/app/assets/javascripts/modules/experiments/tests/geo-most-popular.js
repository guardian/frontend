define([
    'common/utils/detect',
    'common/modules/onward/right-hand-component-factory'
], function (
    detect,
    RightHandComponentFactory
    ) {

    var GeoMostPopular = function () {

        var self = this;

        this.id = 'GeoMostPopular';
        this.start = '2014-02-26';
        this.expiry = '2014-03-14';
        this.author = 'Richard Nguyen';
        this.description = 'Choose popular trails based on request location.';
        this.audience = 0.1;
        this.audienceOffset = 0.4;
        this.successMeasure = 'Click-through for the right most popular, and page views per visit.';
        this.audienceCriteria = 'Users who are not on mobile, viewing an article.';
        this.dataLinkNames = 'right hand most popular geo. Specific countries appear as: right hand most popular geo GB';
        this.idealOutcome = 'Click-through is increased on articles, mostly in US, Australia and India regions.';

        this.canRun = function(config) {
            return config.page.contentType === 'Article' && detect.getBreakpoint() !== 'mobile';
        };

        this.variants = [
            {
                id: 'control',
                test: function(context, config) {
                }
            },
            {
                id: 'geo-based-popular',
                test: function(context, config) {
                    RightHandComponentFactory.setRecommendationsSource("geo-popular");
                }
            }
        ];
    };


    return GeoMostPopular;

});
