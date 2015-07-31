define([
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/template',
    'text!common/views/commercial/outbrain.html'
], function (
    fastdom,
    $,
    _,
    config,
    detect,
    mediator,
    template,
    outbrainTpl
) {
    var outbrainUrl = '//widgets.outbrain.com/outbrain.js',
        $outbrain   = $('.js-outbrain'),
        $container  = $('.js-outbrain-container');

    function load() {
        // outbrain leaks the URL of preview content so we don't show it there.
        if (config.switches.outbrain && !config.page.isPreview && $outbrain.length > 0) {
            var widgetIds = {},
                widgetCode, widgetCodeImage, widgetCodeText;

            widgetIds = {
                mobile: 'MB_2',
                tablet: 'MB_1',
                desktop: 'AR_11',
                wide: 'AR_11'
            };

            widgetCode = widgetIds[detect.getBreakpoint()];

            if (config.switches.newOutbrain) {
                widgetConfig = {
                    desktop: {
                        image: {
                            sections: 'AR_12',
                            all     : 'AR_13'
                        },
                        text: {
                            sections: 'AR_14',
                            all     : 'AR_15'  
                        }
                    },
                    tablet: {
                        image: {
                            sections: 'MB_6',
                            all     : 'MB_7'
                        },
                        text: {
                            sections: 'MB_8',
                            all     : 'MB_9'
                        }
                    },
                    mobile: {
                        image: {
                            sections: 'MB_4',
                            all     : 'MB_5'
                        }
                    }
                };

                var breakpoint = detect.getBreakpoint();
                    breakpoint = (_.contains(['wide', 'desktop'], breakpoint)) ? 'desktop' : breakpoint;

                widgetCodeImage = widgetConfig[breakpoint]['image'][getSection()];
                widgetCode = widgetCodeImage;
            }

            fastdom.write(function () {
                $outbrain.css('display', 'block');
                $container.append($.create(template(
                    outbrainTpl,
                    {
                        className: 'outbrainImage',
                        widgetCode: widgetCode
                    })
                ));
            });

            if (config.switches.newOutbrain && breakpoint !== 'mobile') {
                widgetCodeText  = widgetConfig[breakpoint]['text'][getSection()];

                fastdom.write(function () {
                    $container.append($.create(template(
                        outbrainTpl,
                        {
                            className: 'outbrainText',
                            widgetCode: widgetCodeText
                        })
                    ));
                });
            }

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
