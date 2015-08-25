define([
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/template',
    'common/modules/identity/api',
    'text!common/views/commercial/outbrain.html'
], function (
    fastdom,
    $,
    _,
    config,
    detect,
    mediator,
    template,
    identity,
    outbrainTpl
) {
    var outbrainUrl = '//widgets.outbrain.com/outbrain.js';

    function load() {
        var $outbrain  = $('.js-outbrain'),
            $container = $('.js-outbrain-container');
        // outbrain leaks the URL of preview content so we don't show it there.
        if (config.switches.outbrain && !config.page.isPreview && $outbrain.length > 0 && !identity.isUserLoggedIn()) {
            var widgetConfig = {},
                breakpoint = detect.getBreakpoint(),
                widgetCode, widgetCodeImage, widgetCodeText;

            breakpoint = (_.contains(['wide', 'desktop'], breakpoint)) ? 'desktop' : breakpoint;
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

            widgetCodeImage = widgetConfig[breakpoint].image[getSection()];
            widgetCode = widgetCodeImage;

            fastdom.write(function () {
                $outbrain.css('display', 'block');
                $container.append($.create(template(outbrainTpl, { widgetCode: widgetCode })));
            });

            if (breakpoint !== 'mobile') {
                widgetCodeText  = widgetConfig[breakpoint].text[getSection()];

                fastdom.write(function () {
                    $container.append($.create(template(outbrainTpl, { widgetCode: widgetCodeText })));
                });
            }

            return require(['js!' + outbrainUrl]);
        }
    }

    function getSection() {
        return config.page.section.toLowerCase().match('news')
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
        init: init
    };
});
