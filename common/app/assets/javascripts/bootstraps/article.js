define([
    "common/common",
    "common/utils/mediator",
    "common/utils/detect",
    "common/$",
    "fence",
    "common/modules/ui/autoupdate",
    "common/modules/live/filter",
    "common/modules/sport/football/matchnav",
    "common/modules/discussion/loader",
    "common/modules/sport/cricket",
    "common/modules/ui/notification-counter",
    "common/modules/experiments/left-hand-card",
    "common/modules/open/cta",
    "common/modules/commercial/loader",
    "common/modules/experiments/layoutHints"
], function (
    common,
    mediator,
    detect,
    $,
    fence,
    AutoUpdate,
    LiveFilter,
    MatchNav,
    DiscussionLoader,
    Cricket,
    NotificationCounter,
    LeftHandCard,
    OpenCta,
    CommercialLoader,
    Layout
) {

    var modules = {

        matchNav: function(){
            var matchNav = new MatchNav();
            common.mediator.on('page:article:ready', function(config, context) {
                if(config.page.section === "football") {
                    var teamIds = config.referencesOfType('paFootballTeam'),
                        isRightTypeOfContent = config.hasTone("Match reports") || config.page.isLiveBlog;

                    if(teamIds.length === 2 && isRightTypeOfContent){
                        var url = "/football/api/match-nav/" +
                                  config.webPublicationDateAsUrlPart() + "/" +
                                  teamIds[0] + "/" + teamIds[1] +
                                  ".json?page=" + encodeURIComponent(config.page.pageId);

                        matchNav.load(url, context);
                    }
                }
            });
        },

        initLiveBlogging: function() {
            common.mediator.on('page:article:ready', function(config, context) {
                if (config.page.isLive) {

                    var timerDelay = /desktop|wide/.test(detect.getBreakpoint()) ? 30000 : 60000,
                        a = new AutoUpdate({
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
                    var lf = new LiveFilter(context).init(),
                        nc = new NotificationCounter().init();
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

        initDoge: function() {
            common.mediator.on('page:article:ready', function(config, context) {
                if (config.switches.doge) {
                    $('.article__headline').css({fontFamily:'"Comic Sans MS", cursive', color:'pink'});
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

        externalLinksCards: function () {
            common.mediator.on('page:article:ready', function(config, context) {
                if (config.switches && config.switches.externalLinksCards) {
                    var card = new LeftHandCard({
                            origin: 'internal',
                            context: context
                    });
                }
            });
        },

        initOpen: function() {
            common.mediator.on('page:article:ready', function(config, context) {
                if (config.switches.openCta && config.page.commentable) {
                    var openCta = new OpenCta(context, common.mediator, {
                            discussionKey: config.page.shortUrl.replace('http://gu.com/', '')
                        }),
                        $openCtaElem = $('.open-cta');

                    if ($openCtaElem[0]) {
                        openCta.fetch($openCtaElem[0]);
                    }
                }
            });
        },

        initFence: function() {
            common.mediator.on('page:article:ready', function(config, context) {
                $('.fenced').each(function(el) {
                    fence.render(el);
                });
            });
        },

        initLayoutHints: function(config) {
            if(config.switches.layoutHints && /\/-sp-/g.test(config.page.pageId)) {
                var l = new Layout(config);
            }
        }
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.matchNav();
            modules.initLiveBlogging();
            modules.initDiscussion();
            modules.initDoge();
            modules.initCricket();
            modules.externalLinksCards();
            modules.initOpen(config);
            modules.initFence();
            modules.initLayoutHints(config);
        }
        common.mediator.emit("page:article:ready", config, context);
    };

    return {
        init: ready
    };

});
