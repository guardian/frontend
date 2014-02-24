define( [
    'lodash/objects/assign',
    'common/utils/detect',
    'common/utils/mediator',

    'common/modules/onward/right-most-popular',
    'common/modules/onward/right-recommended',
    'common/modules/onward/right-outbrain-recommendations',
    'common/modules/onward/geo-most-popular'
], function (
    extend,
    detect,
    mediator,

    RightMostPopular,
    RightRecommended,
    RightOutbrainRecommendations,
    GeoMostPopular
){

    function RightHandComponentFactory(config) {
        this.config = config;
        this.pageId = this.config.pageId;
        if( detect.getBreakpoint() !== 'mobile' && parseInt(this.config.wordCount, 10) > 500  ) {
            this.renderRightHandComponent();
        }
    }

    RightHandComponentFactory.rightHandDataSource = 'default';
    RightHandComponentFactory.setRecommendationsSource = function(dataSourceName) {
        RightHandComponentFactory.rightHandDataSource = dataSourceName;
    };

    RightHandComponentFactory.prototype.renderRightHandComponent = function() {

        switch (RightHandComponentFactory.rightHandDataSource) {

            case "default":
                var mostPopular = new RightMostPopular(mediator, {type: 'image', maxTrails: 5});
                break;

            case "gravity":
                var recommended = new RightRecommended(mediator, {type: 'image', maxTrails: 5});
                break;

            case "outbrain":
                var outbrain = new RightOutbrainRecommendations(mediator, {type: 'image', maxTrails: 5, pageId:this.pageId});
                break;

            case "geo-popular":
                var geoPopular = new GeoMostPopular(mediator, {type: 'image', maxTrails: 5});
                break;

            default:
                mediator.emit('module:error', 'Unknown Right Hand component defined: ' + RightHandComponentFactory.rightHandDataSource, 'onward/right-hand-component-factory.js');
                var defaultPopular = new RightMostPopular(mediator, {type: 'image', maxTrails: 5});
        }
    };

    return RightHandComponentFactory;
});