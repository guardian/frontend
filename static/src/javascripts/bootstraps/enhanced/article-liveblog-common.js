/** Bootstrap for functionality common to articles and live blogs */
define([
    'fence',
    'common/utils/$',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/robust',
    'common/modules/article/twitter',
    'common/modules/open/cta',
    'common/modules/ui/last-modified',
    'common/modules/ui/rhc',
    'common/modules/ui/selection-sharing'
], function (
    fence,
    $,
    config,
    mediator,
    robust,
    twitter,
    OpenCta,
    lastModified,
    rhc,
    selectionSharing
) {
    function initOpenCta() {
        if (config.switches.openCta && config.page.commentable) {
            var openCta = new OpenCta(mediator, {
                discussionKey: config.page.shortUrl.replace('http://gu.com/', '')
            });

            $.create('<div class="open-cta"></div>').each(function (el) {
                openCta.fetch(el);
                if (!config.page.isLiveBlog) { rhc.addComponent(el); }
            });
        }
    }

    function initFence() {
        $('.fenced').each(function (el) {
            fence.render(el);
        });
    }

    function initTwitter() {
        // Ensure that truncation occurs before the tweet upgrading.
        twitter.init();
        twitter.enhanceTweets();
    }

    return function () {
        robust.catchErrorsAndLogAll([
            ['trail-article', initOpenCta],
            ['trail-fence', initFence],
            ['trail-twitter', initTwitter],
            ['trail-sharing', selectionSharing.init],
            ['trail-last-modified', lastModified]
        ]);
    };
});
