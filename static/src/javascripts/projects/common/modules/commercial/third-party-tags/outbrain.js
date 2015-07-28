define([
    'common/utils/$',
    'common/utils/config',
    'common/utils/contains',
    'common/utils/detect',
    'common/utils/mediator',
], function (
    $,
    config,
    contains,
    detect,
    mediator
) {
    var outbrainUrl = '//widgets.outbrain.com/outbrain.js';

    function load() {
        // outbrain leaks the URL of preview content so we don't show it there.
        if (config.switches.outbrain && !config.page.isPreview) {
            var widgetIds = {
                mobile: 'MB_2',
                tablet: 'MB_1',
                desktop: 'AR_11',
                wide: 'AR_11'
            };

            var newWidgetIds = {
                wide: {
                    sections: 'AR_12',
                    all     : 'AR_13'
                },
                desktop: {
                    sections: 'AR_14',
                    all     : 'AR_15'  
                },
                tablet: {
                    sections: 'MB_8',
                    all     : 'MB_9'
                },
                mobile: {
                    sections: 'MB_4',
                    all     : 'MB_5'
                }
            };

            console.log(getSection(), newWidgetIds[detect.getBreakpoint()][getSection()]);

            $('.OUTBRAIN')
                .first()
                .attr('data-widget-id', widgetIds[detect.getBreakpoint()]);
            return require(['js!' + outbrainUrl]);
        }
    }

    function getSection() {
        return contains(['uk', 'us', 'au', 'international'], config.page.pageId.toLowerCase()) 
            || contains(['politics', 'world'], config.page.section.toLowerCase()) ? 'sections' : 'all';
    }

    function init() {
        mediator.on('modules:commercial:dfp:rendered', function (event) {
            if (event.slot.getSlotId().getDomId() === 'dfp-ad--merchandising-high' && event.isEmpty) {
                load();
            }
        });
    }

    return {
        init: init,
        load: load
    };
});
