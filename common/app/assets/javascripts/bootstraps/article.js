define([
    'common/utils/mediator',
    'common/utils/$',
    'fence',
    'common/modules/ui/rhc',
    'common/modules/article/truncate',
    'common/modules/article/twitter',
    'common/modules/open/cta',
    'common/modules/article/world-cup',
    'lodash/collections/contains'

], function (
    mediator,
    $,
    fence,
    rhc,
    truncate,
    twitter,
    OpenCta,
    worldCup,
    _contains
) {

    var modules = {

        initOpen: function(config, context) {
            if (config.switches.openCta && config.page.commentable) {
                var openCta = new OpenCta(context, mediator, {
                    discussionKey: config.page.shortUrl.replace('http://gu.com/', '')
                });

                $.create('<div class="open-cta"></div>').each(function(el) {
                    openCta.fetch(el);
                    if(!config.page.isLiveBlog){ rhc.addComponent(el); }
                });
            }
        },

        initFence: function() {
            $('.fenced').each(function(el) {
                fence.render(el);
            });
        },

        initTruncateAndTwitter: function() {
            // Ensure that truncation occurs before the tweet upgrading.
            truncate();
            twitter.enhanceTweets();
        },

        initWorldCup: function(config) {
            // Only add the world cup container on pages with the world cup keyword.
            var pageTags = config.page.keywordIds.split(',');
            if (config.switches.worldcupArticleContainer && _contains(pageTags,'football/world-cup-2014')) {
                worldCup();
            }
        }
    };

    var ready = function (config, context) {
        for (var init in modules) {
            if (modules.hasOwnProperty(init)) {
                mediator.on('page:article:ready', modules[init]);
            }
        }
        mediator.emit('page:article:ready', config, context);
    };

    return {
        init: ready,
        modules: modules // exporting for LiveBlog bootstrap to use
    };
});
