/** Bootstrap for functionality common to articles and live blogs */
define([
    'fence',
    'lib/$',
    'lib/config',
    'lib/mediator',
    'lib/robust',
    'common/modules/accessibility/helpers',
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
    accessibility,
    twitter,
    OpenCta,
    lastModified,
    rhc,
    selectionSharing
) {
    function initOpenCta() {
        if (config.switches.openCta && config.page.commentable) {
            var openCta = new OpenCta(mediator, {
                discussionKey: config.page.shortUrlId || ''
            });

            $.create('<div class="open-cta"></div>').each(function (el) {
                openCta.fetch(el);
                if (!config.page.isLiveBlog && !config.page.isMinuteArticle) { rhc.addComponent(el); }
            });
        }
    }

    function initFence() {
        $('.fenced').each(function (el) {
            fence.render(el);
        });
    }

    function initTwitter() {
        twitter.init();
        twitter.enhanceTweets();
    }

    return function () {
        robust.context([
            ['trail-a11y',       accessibility.shouldHideFlashingElements],
            ['trail-article', initOpenCta],
            ['trail-fence', initFence],
            ['trail-twitter', initTwitter],
            ['trail-sharing', selectionSharing.init],
            ['trail-last-modified', lastModified]
        ]);
    };
});
