define([
    'fastdom',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/template',
    'common/modules/identity/api',
    'text!common/views/commercial/outbrain.html',
    'lodash/collections/contains'
], function (
    fastdom,
    $,
    config,
    detect,
    template,
    identity,
    outbrainTpl,
    contains
) {
    var outbrainUrl = '//widgets.outbrain.com/outbrain.js';

    function tracking(widgetCode) {
        // Ophan
        require(['ophan/ng'], function (ophan) {
            ophan.record({
                outbrain: {
                    widgetId: widgetCode
                }
            });
        });
    }

    function getSection() {
        return config.page.section.toLowerCase().match('news')
        || contains(['politics', 'world', 'business', 'commentisfree'], config.page.section.toLowerCase()) ? 'sections' : 'all';
    }

    function load() {
        var $outbrain    = $('.js-outbrain'),
            $container   = $('.js-outbrain-container'),
            widgetConfig = {},
            breakpoint   = detect.getBreakpoint(),
            section      = this.getSection(),
            widgetCode,
            widgetCodeImage,
            widgetCodeText;

        breakpoint = (contains(['wide', 'desktop'], breakpoint)) ? 'desktop' : breakpoint;
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

            this.tracking(widgetCode);
            require(['js!' + outbrainUrl]);
        }.bind(this));
    }

    return {
        // made public for testing purposes
        getSection: getSection,
        tracking: tracking,

        load: load
    };
});
