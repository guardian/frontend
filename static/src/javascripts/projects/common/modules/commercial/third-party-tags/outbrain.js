define([
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator'
], function (
    fastdom,
    $,
    _,
    config,
    detect,
    mediator
) {
    var outbrainUrl = '//widgets.outbrain.com/outbrain.js',
        $outbrain = $('.js-outbrain');

    function load() {
        // outbrain leaks the URL of preview content so we don't show it there.
        if (config.switches.outbrain && !config.page.isPreview && $outbrain.length > 0) {
            var widgetIds = {},
                widgetCode;

            widgetIds = {
                mobile: 'MB_2',
                tablet: 'MB_1',
                desktop: 'AR_11',
                wide: 'AR_11'
            };

            widgetCode = widgetIds[detect.getBreakpoint()];

            if (config.switches.newOutbrain) {
                widgetIds = {
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

                widgetCode = widgetIds[detect.getBreakpoint()][getSection()];
            }

            fastdom.write(function () {
                $outbrain.css('display', 'block');
            });

            $('.OUTBRAIN')
                .first()
                .attr('data-widget-id', widgetCode);
            return require(['js!' + outbrainUrl]);
        }
    }

    function getSection() {
        return _.contains(['uk'], config.page.pageId.toLowerCase())
            || _.contains(['politics', 'world', 'business', 'commentisfree'], config.page.section.toLowerCase()) ? 'sections' : 'all';
    }

    function init() {
        mediator.on('modules:commercial:dfp:rendered', function (event) {
            if (event.slot.getSlotId().getDomId() === 'dfp-ad--merchandising-high'
                && event.isEmpty && config.page.section !== 'childrens-books-site') {
                load();
            }
        });
    }

    return {
        init: init,
        load: load
    };
});
