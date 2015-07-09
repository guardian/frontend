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
        // outbrain leaks the URL of preview content so we don't show it there.
        if (config.switches.outbrain && !config.page.isPreview) {
            var widgetIds = {
                mobile: 'MB_2',
                tablet: 'MB_1',
                desktop: 'AR_11',
                wide: 'AR_11'
            };
            $('.OUTBRAIN')
                .first()
                .attr('data-widget-id', widgetIds[detect.getBreakpoint()]);
            return require(['js!' + outbrainUrl]);
        }
    }

    return {
        load: load
    };

});
