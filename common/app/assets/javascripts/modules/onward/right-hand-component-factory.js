define( [
    'lodash/objects/assign',
    'common/utils/detect',

    'common/modules/onward/right-most-popular',
    'common/modules/onward/right-outbrain-recommendations'
], function (
    extend,
    detect,

    RightMostPopular,
    RightOutbrainRecommendations
){

    function RightHandComponentFactory(config) {
        this.config = config;
        this.mediator = this.config.mediator;
        this.pageId = this.config.pageId;
        if( detect.getBreakpoint() !== 'mobile' && parseInt(this.config.wordCount, 10) > 500  ) {
            this.renderRightHandComponent();
        }
    }

    RightHandComponentFactory.rightHandDataSource = 'default';
    RightHandComponentFactory.setRecommendedationsSource = function(dataSourceName) {
        RightHandComponentFactory.rightHandDataSource = dataSourceName;
    };

    RightHandComponentFactory.prototype.renderRightHandComponent = function() {

        var components = {
            'gravity' :  function(pageId) { new RightRecommendedForYou(this.mediator,  {type: 'image', maxTrails: 5}); },
            'outbrain' : function(pageId) { new RightOutbrainRecommendations(this.mediator, {type: 'image', maxTrails: 5, pageId: pageId});            },
            'default' : function(pageId) { new RightMostPopular(this.mediator, {type: 'image', maxTrails: 5}); }
        };

        var mp = components[RightHandComponentFactory.rightHandDataSource](this.pageId);
    };

    return RightHandComponentFactory;
});