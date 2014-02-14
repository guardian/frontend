define( [
    'lodash/objects/assign',

    'common/modules/onward/right-most-popular',
    'common/modules/onward/right-recommended',
    'common/modules/onward/right-outbrain-recommendations'
], function (
    extend,

    RightMostPopular,
    RightRecommendedForYou,
    RightOutbrainRecommendations
){

    function RightHandComponentFactory(config) {
        this.config = config;
        this.mediator = this.config.mediator;
        this.pageId = this.config.pageId;
        if(parseInt(this.config.wordCount, 10) > 500) {
            this.renderRightHandComponent();
        }
    }


    RightHandComponentFactory.rightHandDataSource = 'default';
    RightHandComponentFactory.setRecommenedForYou = function(dataSourceName) {
        RightHandComponentFactory.rightHandDataSource = dataSourceName;
    };

    RightHandComponentFactory.prototype.renderRightHandComponent = function() {

        var components = {
            'gravity' :  function(pageId) { var rf = new RightRecommendedForYou(this.mediator,  {type: 'image', maxTrails: 5}); },
            'outbrain' : function(pageId) {
                 var ro = new RightOutbrainRecommendations(this.mediator, {type: 'image', maxTrails: 5, pageId: pageId});
            },
            'default' : function(pageId) { var rp = new RightMostPopular(this.mediator, {type: 'image', maxTrails: 5}); }
        };

        var mp = components[RightHandComponentFactory.rightHandDataSource](this.pageId);
    };


    return RightHandComponentFactory;

});