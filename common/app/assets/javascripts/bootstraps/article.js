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

        initOpen: function(config) {
            if (config.switches.openCta && config.page.commentable) {
                var openCta = new OpenCta(mediator, {
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

    var ready = function (config) {
        modules.initOpen(config);
        modules.initFence();
        modules.initTruncateAndTwitter();

        mediator.emit('page:article:ready', config);
    };

    return {
        init: ready,
        modules: modules // exporting for LiveBlog bootstrap to use
    };
});
