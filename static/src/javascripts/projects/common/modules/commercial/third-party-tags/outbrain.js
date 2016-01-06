define([
    'fastdom',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/identity/api',
    'template!common/views/commercial/outbrain.html',
    'lodash/collections/contains'
], function (
    fastdom,
    $,
    config,
    detect,
    mediator,
    identity,
    outbrainTpl,
    contains
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
                $container.append($.create(outbrainTpl({ widgetCode: widgetCode })));

                if (breakpoint !== 'mobile') {
                    widgetCodeText  = widgetConfig[breakpoint].text[section];
                    $container.append($.create(outbrainTpl({ widgetCode: widgetCodeText })));
                }

                this.tracking(widgetCode);
                require(['js!' + outbrainUrl]);
            }.bind(this));
        },

        tracking: function (widgetCode) {
            // Ophan
            require(['ophan/ng'], function (ophan) {
                ophan.record({
                    outbrain: {
                        widgetId: widgetCode
                    }
                });
            });
        },

        getSection: function () {
            return config.page.section.toLowerCase().match('news')
                || contains(['politics', 'world', 'business', 'commentisfree'], config.page.section.toLowerCase()) ? 'sections' : 'all';
        },

        identityPolicy: function () {
            return (!identity.isUserLoggedIn() || !(identity.isUserLoggedIn() && config.page.commentable));
        },

        hasHighRelevanceComponent: function () {
            return detect.adblockInUse() || config.page.edition.toLowerCase() === 'int';
        },

        init: function () {
            if (config.switches.outbrain
                && !config.page.isFront
                && !config.page.isPreview
                && this.identityPolicy()
                && config.page.section !== 'childrens-books-site') {
                if (this.hasHighRelevanceComponent()) {
                    this.load();
                } else {
                    mediator.on('modules:commercial:dfp:rendered', function (event) {
                        if (event.slot.getSlotId().getDomId() === 'dfp-ad--merchandising-high' && event.isEmpty) {
                            this.load();
                        }
                    }.bind(this));
                }
            }
        }
    };
});
