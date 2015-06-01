define([
    'fence',
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/referrers',
    'common/utils/url',
    'common/modules/article/rich-links',
    'common/modules/article/membership-events',
    'common/modules/article/open-module',
    'common/modules/article/truncate',
    'common/modules/article/twitter',
    'common/modules/onward/facebook-most-popular',
    'common/modules/onward/geo-most-popular',
    'common/modules/open/cta',
    'common/modules/ui/rhc',
    'common/modules/ui/sticky-social',
    'common/modules/ui/selection-sharing'
], function (
    fence,
    qwery,
    $,
    config,
    detect,
    mediator,
    referrers,
    urlutils,
    richLinks,
    membershipEvents,
    openModule,
    truncate,
    twitter,
    FacebookMostPopular,
    geoMostPopular,
    OpenCta,
    rhc,
    stickySocial,
    selectionSharing
) {
    var modules = {
            initOpenCta: function () {
                if (config.switches.openCta && config.page.commentable) {
                    var openCta = new OpenCta(mediator, {
                        discussionKey: config.page.shortUrl.replace('http://gu.com/', '')
                    });

                    $.create('<div class="open-cta"></div>').each(function (el) {
                        openCta.fetch(el);
                        if (!config.page.isLiveBlog) { rhc.addComponent(el); }
                    });
                }
            },

            initFence: function () {
                $('.fenced').each(function (el) {
                    fence.render(el);
                });
            },

            initCmpParam: function () {
                var allvars = urlutils.getUrlVars();

                if (allvars.CMP) {
                    $('.element-pass-cmp').each(function (el) {
                        el.src = el.src + '?CMP=' + allvars.CMP;
                    });
                }
            },

            initTruncateAndTwitter: function () {
                // Ensure that truncation occurs before the tweet upgrading.
                truncate();
                twitter.init();
                twitter.enhanceTweets();
            },

            initRightHandComponent: function () {
                var mainColumn = qwery('.js-content-main-column');
                // only render when we have >1000px or more (enough space for ad + most popular)
                if (mainColumn[0] && mainColumn[0].offsetHeight > 1150 && detect.isBreakpoint({ min: 'desktop' })) {
                    geoMostPopular.render();
                }
            },

            initSelectionSharing: function () {
                selectionSharing.init();
            },

            initStickyShares: function () {
                if (config.switches.abShareButtons2) {
                    stickySocial.init();
                }
            },

            initFacebookMostPopular: function () {
                var el;

                if (config.switches.facebookMostPopular && referrers.isFacebook()) {
                    el = qwery('.js-facebook-most-popular');
                    if (el) {
                        new FacebookMostPopular(el);
                    }
                }
            }
        },

        ready = function () {
            modules.initOpenCta();
            modules.initFence();
            modules.initTruncateAndTwitter();
            modules.initRightHandComponent();
            modules.initSelectionSharing();
            modules.initCmpParam();
            modules.initStickyShares();
            modules.initFacebookMostPopular();
            richLinks.upgradeRichLinks();
            richLinks.insertTagRichLink();
            membershipEvents.upgradeEvents();
            openModule.init();

            mediator.emit('page:article:ready');
        };

    return {
        init: ready,
        modules: modules // exporting for LiveBlog bootstrap to use
    };
});
