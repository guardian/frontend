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

    RightHandComponentFactory.recommended = false;
    RightHandComponentFactory.setRecommendedForYou = function() {
        RightHandComponentFactory.recommended = true;
    };

    RightHandComponentFactory.prototype.renderRightHandComponent = function() {

        if (RightHandComponentFactory.recommended) {
            var rf = new RightOutbrainRecommendations(this.mediator,  {type: 'image', maxTrails: 5});
        } else {
            var rp = new RightMostPopular(this.mediator, {type: 'image', maxTrails: 5})
        }
    };

    return RightHandComponentFactory;
});