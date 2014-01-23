/*global guardian */
define([
    'common/utils/detect'
], function (
    detect
    ) {

    var GravityRecommendations = function () {

        var self = this;

        this.id = 'GravityRecommendations';
        this.expiry = '2014-02-24';
        this.audience = 0.2;
        this.description = 'Dropping Gravitys beacon javascript on the site';
        this.canRun = function(config) {
            return (config.page.contentType === 'Article'  && (/wide|desktop/).test(detect.getBreakpoint()));
        };
        this.variants = [
            {
                id: 'control',
                test: function(context, config) {
                    require(['js!gravity'], function(){});
                }
            }
        ];
    };


    return GravityRecommendations;

});
