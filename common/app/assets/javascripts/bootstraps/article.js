define([
    'common/utils/common',
    'common/utils/mediator',
    'common/utils/$',
    'fence',
    'common/modules/ui/rhc',
    'common/modules/article/truncate',
    'common/modules/article/twitter',
    'common/modules/open/cta',
    'common/bootstraps/liveblog',
    'common/modules/article/world-cup',
    'lodash/collections/contains'

], function (
    common,
    mediator,
    $,
    fence,
    rhc,
    truncate,
    twitter,
    OpenCta,
    LiveBlog,
    worldCup,
    _contains
) {

    var modules = {
        initLiveBlogging: function(config) {
            if (config.page.isLiveBlog) {
                LiveBlog.init();
            }
        },

        initOpen: function() {
            common.mediator.on('page:article:ready', function(config, context) {
                if (config.switches.openCta && config.page.commentable) {
                    var openCta = new OpenCta(context, common.mediator, {
                        discussionKey: config.page.shortUrl.replace('http://gu.com/', '')
                    });

                    $.create('<div class="open-cta"></div>').each(function(el) {
                        openCta.fetch(el);
                        if(!config.page.isLiveBlog){ rhc.addComponent(el); }
                    });
                }
            });
        },

        initFence: function() {
            common.mediator.on('page:article:ready', function() {
                $('.fenced').each(function(el) {
                    fence.render(el);
                });
            });
        },

        initTruncateAndTwitter: function() {
            mediator.on('page:article:ready', function() {
                // Ensure that truncation occurs before the tweet upgrading.
                truncate();
                twitter.enhanceTweets();
            });
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
        if (!this.initialised) {
            this.initialised = true;
            modules.initLiveBlogging(config);
            modules.initOpen(config);
            modules.initFence();
            modules.initTruncateAndTwitter();
            modules.initWorldCup(config);
        }
        common.mediator.emit('page:article:ready', config, context);
    };

    return {
        init: ready
    };

});
