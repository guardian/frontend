define([
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
], function (
    $,
    config,
    detect,
    mediator
) {
    var outbrainUrl = '//widgets.outbrain.com/outbrain.js';

    function load() {
        console.log('loading OB');
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

    function init() {
        mediator.on('modules:commercial:dfp:rendered', function (event) {
            if (event.slot.getSlotId().getDomId() === 'dfp-ad--merchandising-high' && event.isEmpty) {
                load();
            }
        });
    }

    function shouldLoadOutbrain() {

    }

    return {
        init: init,
        load: load
    };

});
