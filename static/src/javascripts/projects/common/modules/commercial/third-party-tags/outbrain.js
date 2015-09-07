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

    return {
        load: function () {
            var $outbrain    = $('.js-outbrain'),
                $container   = $('.js-outbrain-container'),
                widgetConfig = {},
                breakpoint   = detect.getBreakpoint(),
                section      = this.getSection(),
                widgetCode,
                widgetCodeImage,
                widgetCodeText,
                s = window.s;

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

            widgetCodeImage = widgetConfig[breakpoint].image[section];
            widgetCode = widgetCodeImage;

            fastdom.write(function () {
                $outbrain.css('display', 'block');
                $container.append($.create(template(outbrainTpl, { widgetCode: widgetCode })));

                if (breakpoint !== 'mobile') {
                    widgetCodeText  = widgetConfig[breakpoint].text[section];
                    $container.append($.create(template(outbrainTpl, { widgetCode: widgetCodeText })));
                }

                s.link2 = 'outbrain';
                s.tl(true, 'o', 'outbrain');

                require(['js!' + outbrainUrl]);
            });
        },

        getSection: function () {
            return config.page.section.toLowerCase().match('news')
                || _.contains(['politics', 'world', 'business', 'commentisfree'], config.page.section.toLowerCase()) ? 'sections' : 'all';
        },

        init: function () {
            if (config.switches.outbrain && !config.page.isPreview && !identity.isUserLoggedIn() && config.page.section !== 'childrens-books-site') {
                mediator.on('modules:commercial:dfp:rendered', function (event) {
                    if (event.slot.getSlotId().getDomId() === 'dfp-ad--merchandising-high' && event.isEmpty) {
                        this.load();
                    }
                }.bind(this));
            }
        }
    };
});
