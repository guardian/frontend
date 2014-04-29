define([
    'common/common',
    'common/utils/mediator',
    'common/utils/detect',
    'common/$',
    'fence',
    'common/modules/ui/rhc',
    'common/modules/article/truncate',
    'common/modules/article/twitter',
    'common/modules/ui/autoupdate',
    'common/modules/live/filter',
    'common/modules/discussion/loader',
    'common/modules/ui/notification-counter',
    'common/modules/open/cta',
    'common/modules/experiments/layoutHints'
], function (
    common,
    mediator,
    detect,
    $,
    fence,
    rhc,
    truncate,
    twitter,
    AutoUpdate,
    LiveFilter,
    DiscussionLoader,
    NotificationCounter,
    OpenCta,
    Layout
) {

    var modules = {
        initLiveBlogging: function() {
            common.mediator.on('page:article:ready', function(config, context) {
                if (config.page.isLive) {

                    var timerDelay = /desktop|wide/.test(detect.getBreakpoint()) ? 30000 : 60000;
                    new AutoUpdate({
                        path: function() {
                            var id = context.querySelector('.article-body .block').id,
                                path = window.location.pathname;

                           return path + '.json' + '?lastUpdate=' + id;
                        },
                        delay: timerDelay,
                        attachTo: context.querySelector('.article-body'),
                        switches: config.switches,
                        manipulationType: 'prepend',
                        animateInserts: true,
                        progressToggle: true,
                        progressColour: '#ec1c1c'
                    }).init();
                }
                if (config.page.isLiveBlog) {
                    new LiveFilter(context).init();
                    new NotificationCounter().init();
                }
            });
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
            modules.initLiveBlogging();
            modules.initDiscussion();
            modules.initOpen(config);
            modules.initFence();
            modules.initLayoutHints(config);
            modules.initTruncateAndTwitter();
        }
        common.mediator.emit('page:article:ready', config, context);
    };

    return {
        init: ready
    };

});
