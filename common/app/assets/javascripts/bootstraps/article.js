define([
    "common",
    "$",
    "modules/ui/autoupdate",
    "modules/live/filter",
    "modules/live/summary",
    "modules/sport/football/matchnav",
    "modules/analytics/reading",
    "modules/discussion/loader",
    "modules/sport/cricket",
    "modules/experiments/live-blog-show-more",
    "modules/ui/notification-counter",
    "utils/detect",
    "modules/experiments/left-hand-card",
    "modules/open/cta"
], function (
    common,
    $,
    AutoUpdate,
    LiveFilter,
    LiveSummary,
    MatchNav,
    Reading,
    DiscussionLoader,
    Cricket,
    LiveShowMore,
    NotificationCounter,
    detect,
    LeftHandCard,
    OpenCta
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

                    var timerDelay = /desktop|extended/.test(detect.getLayoutMode()) ? 30000 : 60000,
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


                    if (config.switches.liveSummary) {
                        var ls = new LiveSummary(context).init();
                    }
                }
            });
        },

        initDiscussion: function() {

            common.mediator.on('page:article:ready', function(config, context) {
                if (config.page.commentable) {
                    var discussionLoader = new DiscussionLoader(context, common.mediator);
                    discussionLoader.attachTo();
                }
            });
        },

        logReading: function() {
            common.mediator.on('page:article:ready', function(config, context) {
                var wordCount = config.page.wordCount;
                if(wordCount !== "") {

                    var reader = new Reading({
                        id: config.page.pageId,
                        wordCount: parseInt(config.page.wordCount, 10),
                        el: context.querySelector('.article-body'),
                        ophanUrl: config.page.ophanUrl
                    });

                    reader.init();
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
                var openCta = new OpenCta(context);
                openCta.fetch($('.js-open-cta')[0]);
            });
        }
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.matchNav();
            modules.initLiveBlogging();
            modules.logReading();
            modules.initDiscussion();
            modules.initCricket();
            modules.externalLinksCards();
            modules.initOpen();
        }
        common.mediator.emit("page:article:ready", config, context);
    };

    return {
        init: ready
    };

});
