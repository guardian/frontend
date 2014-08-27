define([
    'common/utils/mediator',
    'common/utils/$',
    'fence',
    'common/modules/ui/rhc',
    'common/modules/article/truncate',
    'common/modules/article/twitter',
    'common/modules/open/cta'

], function (
    mediator,
    $,
    fence,
    rhc,
    truncate,
    twitter,
    OpenCta
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
        }
    };

    var ready = function (config, context) {
        modules.initOpen(config, context);
        modules.initFence();
        modules.initTruncateAndTwitter();

        mediator.emit('page:article:ready', config, context);
    };

    return {
        init: ready,
        modules: modules // exporting for LiveBlog bootstrap to use
    };
});
