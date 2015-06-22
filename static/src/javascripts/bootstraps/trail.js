/** Bootstrap for functionality common to all trail pages: article, live blogs, podcasts, videos, etc. */
define([
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/utils/robusts',
    'common/utils/proximity-loader',
    'common/modules/commercial/comment-adverts',
    'common/modules/onward/onward-content',
    'common/modules/onward/popular',
    'common/modules/onward/related',
    'common/modules/onward/tonal'
], function (
    qwery,
    $,
    config,
    robusts,
    proximityLoader,
    commentAdverts,
    Onward,
    Popular,
    Related,
    TonalComponent
) {
    function initPopular() {
        if (!config.page.isFront) {
            if (window.location.hash) {
                modules.transcludePopular();
            } else {
                var onwardEl = qwery('.js-popular-trails')[0];
                if (onwardEl) {
                    proximityLoader.add(onwardEl, 1500, function () {
                        new Popular().init();
                    });
                }
            }
        }
    }

    function initRelated() {
        if (window.location.hash) {
            modules.transcludeRelated();
        } else {
            var relatedEl = qwery('.js-related')[0];
            if (relatedEl) {
                proximityLoader.add(relatedEl, 1500, function () {
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
                });
            }
        }
    }

    function initOnwardContent() {
        if (window.location.hash) {
            modules.transcludeOnwardContent();
        } else {
            var onwardEl = qwery('.js-onward')[0];
            if (onwardEl) {
                proximityLoader.add(onwardEl, 1500, function () {
                    if ((config.page.seriesId || config.page.blogIds) && config.page.showRelatedContent) {
                        new Onward(qwery('.js-onward'));
                    } else if (config.page.tones !== '') {
                        $('.js-onward').each(function (c) {
                            new TonalComponent().fetch(c, 'html');
                        });
                    }
                });
            }
        }
    }

    return function () {
        robusts([
            ['c-popular', initPopular],
            ['c-related', initRelated],
            ['c-onward', initOnwardContent],
            ['c-comment-adverts', commentAdverts]
        ]);
    }
});