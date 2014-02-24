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
        this.expiry = '2014-03-14';
        this.audience = 0.1;
        this.audienceOffset = 0.4;
        this.description = 'Choose popular trails based on request location';
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
