define([
    'common/common',
    'common/utils/mediator',
    'common/$',
    'fence',
    'common/modules/ui/rhc',
    'common/modules/article/truncate',
    'common/modules/article/twitter',
    'common/modules/discussion/loader',
    'common/modules/open/cta',
    'common/bootstraps/liveblog'

], function (
    common,
    mediator,
    $,
    fence,
    rhc,
    truncate,
    twitter,
    DiscussionLoader,
    OpenCta,
    LiveBlog
) {

    var modules = {
        initLiveBlogging: function(config) {
            if (config.page.isLiveBlog) {
                LiveBlog.init();
            }
        },

        initDiscussion: function() {
            common.mediator.on('page:article:ready', function(config, context) {
                if (config.page.commentable && config.switches.discussion) {
                    var discussionLoader = new DiscussionLoader(context, common.mediator, { 'switches': config.switches });
                    discussionLoader.attachTo($('.discussion')[0]);
                }
            });
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
        }
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.initLiveBlogging(config);
            modules.initDiscussion();
            modules.initOpen(config);
            modules.initFence();
            modules.initTruncateAndTwitter();
        }
        common.mediator.emit('page:article:ready', config, context);
    };

    return {
        init: ready
    };

});
