/*global guardian */
define([
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/onward/right-hand-component-factory'
], function (
    detect,
    mediator,
    RightHandComponent
    ) {

    var GravityRecommendations = function () {

        var self = this;

        this.id = 'GravityRecommendations';
        this.expiry = '2014-02-20';
        this.audience = 0.2;
        this.audienceOffset = 0.8;
        this.description = 'Dropping Gravity\'s beacon javascript on the site';
        this.canRun = function(config) {
            return true;
        };
        this.variants = [
            {
                id: 'control',
                test: function(context, config) {
                    require(['js!gravity'], function(){});
                }
            },
            {
                id: 'show-gravity-recommendations',
                test: function(context, config) {
                    RightHandComponent.setRecommenedForYou();
                    require(['js!gravity'], function(){});
                }
            }
        ];
    };


    return GravityRecommendations;

});
