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
    'common/modules/experiments/layoutHints',
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
    Layout,
    LiveBlog
) {

    var modules = {
        initLiveBlogging: function(config) {
            if (config.page.isLiveBlog) {
                LiveBlog.init(config);
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
                        rhc.addComponent(el);
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

        initLayoutHints: function(config) {
            /* jshint nonew: false */
            /* TODO - fix module constructors so we can remove the above jshint override */
            if(config.switches.layoutHints && /\/-sp-/g.test(config.page.pageId)) {
                new Layout(config);
            }
        },

        initHelvetica: function(config) {
            if(config.switches.helvetica && /\/helvetica-one-font-to-rule-them-all/g.test(config.page.pageId)) {
                var articleHeadline = document.querySelector('.article__headline');
                articleHeadline.style.fontFamily = 'Helvetica, "EgyptianHeadline", georgia, serif';
                articleHeadline.style.fontWeight = 'bold';
                articleHeadline.style.letterSpacing = '-1px';
            }
        },

        initComicSans: function(config) {
            if(config.switches.comicsans && /\/comic-sans-neue-look-dare-use-it/g.test(config.page.pageId)) {
                var articleHeadline = document.querySelector('.article__headline');
                articleHeadline.style.fontFamily = '"Comic Sans Neue", "Comic Sans MS", "EgyptianHeadline", georgia, serif';
                articleHeadline.style.fontWeight = 'bold';
                articleHeadline.style.letterSpacing = '-1px';
            }
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
            modules.initLayoutHints(config);
            modules.initHelvetica(config);
            modules.initComicSans(config);
            modules.initTruncateAndTwitter();
        }
        common.mediator.emit('page:article:ready', config, context);
    };

    return {
        init: ready
    };

});
