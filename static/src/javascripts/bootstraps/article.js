define([
    'fence',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/article/truncate',
    'common/modules/article/twitter',
    'common/modules/onward/geo-most-popular',
    'common/modules/open/cta',
    'common/modules/ui/rhc'
], function (
    fence,
    $,
    config,
    detect,
    mediator,
    truncate,
    twitter,
    geoMostPopular,
    OpenCta,
    rhc
) {

    var modules = {

            initOpen: function () {
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

            initRightHandComponent: function () {
                if (detect.getBreakpoint() !== 'mobile' && parseInt(config.page.wordCount, 10) > 500) {
                    geoMostPopular.render();
                }
            }

        },

        ready = function () {
            modules.initOpen();
            modules.initFence();
            modules.initTruncateAndTwitter();
            modules.initRightHandComponent();

            mediator.emit('page:article:ready');
        };

    return {
        init: ready,
        modules: modules // exporting for LiveBlog bootstrap to use
    };
});
