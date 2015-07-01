/*eslint-disable no-new*/
define([
    'fence',
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/url',
    'common/modules/article/rich-links',
    'common/modules/article/membership-events',
    'common/modules/article/open-module',
    'common/modules/article/truncate',
    'common/modules/article/twitter',
    'common/modules/experiments/ab',
    'common/modules/onward/geo-most-popular',
    'common/modules/open/cta',
    'common/modules/onward/social-most-popular',
    'common/modules/ui/rhc',
    'common/modules/ui/selection-sharing'
], function (
    fence,
    qwery,
    $,
    config,
    detect,
    mediator,
    urlutils,
    richLinks,
    membershipEvents,
    openModule,
    truncate,
    twitter,
    ab,
    geoMostPopular,
    OpenCta,
    SocialMostPopular,
    rhc,
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

            initSocialMostPopular: function () {
                var el = qwery('.js-social-most-popular');

                ['Twitter', 'Facebook'].forEach(function (socialContext) {
                    if (ab.shouldRunTest(socialContext + 'MostViewed', 'variant')) {
                        if (el) {
                            new SocialMostPopular(el, socialContext.toLowerCase());
                        }
                    }
                });
            },

            initQuizListeners: function () {
                require(['ophan/ng'], function (ophan) {
                    mediator.on('quiz/ophan-event', ophan.record);
                });
            }
        },

        ready = function () {
            modules.initOpenCta();
            modules.initFence();
            modules.initTruncateAndTwitter();
            modules.initRightHandComponent();
            modules.initSelectionSharing();
            modules.initCmpParam();
            modules.initSocialMostPopular();
            modules.initQuizListeners();
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
