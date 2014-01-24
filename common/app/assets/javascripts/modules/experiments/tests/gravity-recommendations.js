/*global guardian */
define([
    'common/utils/detect'
], function (
    detect
    ) {

    var GravityRecommendations = function () {

        var self = this;

        this.id = 'GravityRecommendations';
        this.expiry = '2014-02-08';
        this.audience = 0.2;
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
                    require(['js!gravity'], function(){});
                }
            }
        ];
    };


    return GravityRecommendations;

});
