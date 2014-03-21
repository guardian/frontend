define([
    "common/common",
    "common/utils/mediator",
    "common/utils/detect",
    "common/$",
    "fence",
    "common/modules/ui/rhc",
    "common/modules/ui/autoupdate",
    "common/modules/live/filter",
    "common/modules/discussion/loader",
    "common/modules/sport/cricket",
    "common/modules/ui/notification-counter",
    "common/modules/open/cta",
    "common/modules/commercial/loader",
    "common/modules/experiments/layoutHints"
], function (
    common,
    mediator,
    detect,
    $,
    fence,
    rhc,
    AutoUpdate,
    LiveFilter,
    DiscussionLoader,
    Cricket,
    NotificationCounter,
    OpenCta,
    CommercialLoader,
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
                        attachTo: context.querySelector(".article-body"),
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

        initCricket: function() {
            common.mediator.on('page:article:ready', function(config, context) {

                var cricketMatchRefs = config.referencesOfType('esaCricketMatch');

                if(cricketMatchRefs[0]) {
                    var options = { url: cricketMatchRefs[0],
                                loadSummary: true,
                                loadScorecard: true,
                                summaryElement: '.article__headline',
                                scorecardElement: '.article__headline',
                                summaryManipulation: 'after',
                                scorecardManipulation: 'after' };
                    Cricket.cricketArticle(config, context, options);
                }
            });
        },

        initOpen: function() {
            common.mediator.on('page:article:ready', function(config, context) {
                if (config.switches.openCta && config.page.commentable || true) {
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
        }
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.initLiveBlogging();
            modules.initDiscussion();
            modules.initCricket();
            modules.initOpen(config);
            modules.initFence();
            modules.initLayoutHints(config);
            modules.initHelvetica(config);
        }
        common.mediator.emit("page:article:ready", config, context);
    };

    return {
        init: ready
    };

});
