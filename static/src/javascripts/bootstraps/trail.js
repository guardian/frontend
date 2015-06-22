/** Bootstrap for functionality common to all trail pages: article, live blogs, podcasts, videos, etc. */
define([
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/utils/robust',
    'common/utils/proximity-loader',
    'common/modules/onward/onward-content',
    'common/modules/onward/popular',
    'common/modules/onward/related',
    'common/modules/onward/tonal'
], function (
    qwery,
    $,
    config,
    robust,
    proximityLoader,
    Onward,
    Popular,
    Related,
    TonalComponent
) {

    var modules = {
        transcludeOnwardContent: function () {
            if ((config.page.seriesId || config.page.blogIds) && config.page.showRelatedContent) {
                new Onward(qwery('.js-onward'));
            } else if (config.page.tones !== '') {
                $('.js-onward').each(function (c) {
                    new TonalComponent().fetch(c, 'html');
                });
            }
        },

        transcludePopular: function () {
            new Popular().init();
        },

        transcludeRelated: function () {
            var opts = {
                excludeTags: []
            };

            // exclude ad features from non-ad feature content
            if (config.page.sponsorshipType !== 'advertisement-features') {
                opts.excludeTags.push('tone/advertisement-features');
            }
            // don't want to show professional network content on videos or interactives
            if ('contentType' in config.page && ['video', 'interactive'].indexOf(config.page.contentType.toLowerCase()) >= 0) {
                opts.excludeTags.push('guardian-professional/guardian-professional');
            }
            new Related(opts).renderRelatedComponent();
        },

        initRelated: function () {
            if (window.location.hash) {
                modules.transcludeRelated();
            } else {
                var relatedEl = qwery('.js-related')[0];
                if (relatedEl) {
                    proximityLoader.add(relatedEl, 1500, modules.transcludeRelated);
                }
            }
        },

        initPopular: function () {
            if (!config.page.isFront) {
                if (window.location.hash) {
                    modules.transcludePopular();
                } else {
                    var onwardEl = qwery('.js-popular-trails')[0];
                    if (onwardEl) {
                        proximityLoader.add(onwardEl, 1500, modules.transcludePopular);
                    }
                }
            }
        },

        initOnwardContent: function () {
            if (window.location.hash) {
                modules.transcludeOnwardContent();
            } else {
                var onwardEl = qwery('.js-onward')[0];
                if (onwardEl) {
                    proximityLoader.add(onwardEl, 1500, modules.transcludeOnwardContent);
                }
            }
        }
    };

    return function () {
        robust('c-popular', modules.initPopular);
        robust('c-related', modules.initRelated);
        robust('c-onward', modules.initOnwardContent);
    }
});