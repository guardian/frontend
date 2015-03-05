define([
    'fence',
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/article/flyers',
    'common/modules/article/open-module',
    'common/modules/article/static-social',
    'common/modules/article/truncate',
    'common/modules/article/twitter',
    'common/modules/onward/geo-most-popular',
    'common/modules/open/cta',
    'common/modules/ui/rhc',
    'common/modules/ui/selection-sharing'
], function (
    fence,
    qwery,
    $,
    config,
    detect,
    mediator,
    flyers,
    openModule,
    staticSocial,
    truncate,
    twitter,
    geoMostPopular,
    OpenCta,
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

            initTruncateAndTwitter: function () {
                // Ensure that truncation occurs before the tweet upgrading.
                truncate();
                twitter.init();
                twitter.enhanceTweets();
            },

            initStaticSocial: function () {
                staticSocial();
            },

            initRightHandComponent: function () {
                var mainColumn = qwery('.js-content-main-column');
                // only render when we have >1000px or more (enough space for ad + most popular)
                if (mainColumn[0] && mainColumn[0].offsetHeight > 1000 && !detect.isBreakpoint('mobile')) {
                    geoMostPopular.render();
                }
            },

            initSelectionSharing: function () {
                selectionSharing.init();
            }
        },

        ready = function () {
            modules.initOpenCta();
            modules.initFence();
            modules.initTruncateAndTwitter();
            modules.initRightHandComponent();
            modules.initSelectionSharing();
            modules.initStaticSocial();
            flyers.upgradeFlyers();
            flyers.insertTagFlyer();
            openModule.init();

            mediator.emit('page:article:ready');
        };

    return {
        init: ready,
        modules: modules // exporting for LiveBlog bootstrap to use
    };
});
