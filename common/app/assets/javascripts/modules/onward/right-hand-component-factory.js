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
        console.log("++ So the factory girl is here: Words: " + this.config.wordCount);
        if(parseInt(this.config.wordCount, 10) > 500) {
            console.log("++ So the factory girl: " + this.pageId);
            this.renderRightHandComponent();
        }
    }


    RightHandComponentFactory.rightHandDataSource = 'default';
    RightHandComponentFactory.setRecommenedForYou = function(dataSourceName) {
        RightHandComponentFactory.rightHandDataSource = dataSourceName;
    };

    RightHandComponentFactory.prototype.renderRightHandComponent = function() {

        var components = {
            'gravity' :  function(pageId) { new RightRecommendedForYou(this.mediator,  {type: 'image', maxTrails: 5}); },
            'outbrain' : function(pageId) {
                 console.log("Call me: " + pageId)
                 new RightOutbrainRecommendations(this.mediator, {type: 'image', maxTrails: 5, pageId: pageId});
            },
            'default' : function(pageId) { new RightMostPopular(this.mediator, {type: 'image', maxTrails: 5}); }
        };
        console.log("I'm going to call you: " + this.pageId);

        var mp = components[RightHandComponentFactory.rightHandDataSource](this.pageId);
    };

    return RightHandComponentFactory;

});