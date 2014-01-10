/*global guardian */
define([
    'common/utils/detect'
], function (
    detect
) {

    var ChartbeatDesktop = function () {

        var self = this;
        
        this.id = 'ChartbeatDesktop';
        this.expiry = '2014-01-24';
        this.audience = 0.1;
        this.audienceOffset = 0.5;
        this.description = 'Integration test for Chartbeat monitoring';
        this.canRun = function(config) {
            return (/wide|desktop/).test(detect.getBreakpoint());
        };
        this.variants = [
            {
                id: 'control',
                test: function(context, config) {
                    require(['js!chartbeat'], function () {});
                }
            }
        ];
    };


    return ChartbeatDesktop;

});
