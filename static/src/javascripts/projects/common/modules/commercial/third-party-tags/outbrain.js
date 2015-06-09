define([
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect'
], function (
    $,
    config,
    detect
) {
    var outbrainUrl = 'http://widgets.outbrain.com/outbrain.js';

    function load() {
        if (config.switches.outbrain) {
            var widgetIds = {
                mobile: 'MB_2',
                tablet: 'MB_1',
                desktop: 'AR_11',
                wide: 'AR_11'
            };
            $('.OUTBRAIN')
                .first()
                .attr('data-widget-id', widgetIds[detect.getBreakpoint()]);
            return require([outbrainUrl + '!system-script']);
        }
    }

    return {
        load: load
    };

});
