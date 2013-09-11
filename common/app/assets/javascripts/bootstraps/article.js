define([
    "common",
    "modules/autoupdate",
    "modules/live-filter",
    "modules/live-summary",
    "modules/matchnav",
    "modules/analytics/reading",
    "modules/discussion/discussion",
    "modules/cricket"
], function (
    common,
    AutoUpdate,
    LiveFilter,
    LiveSummary,
    MatchNav,
    Reading,
    Discussion,
    Cricket
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
                                  "?currentPage=" + encodeURIComponent(config.page.pageId);

                        matchNav.load(url, context);
                    }
                }
            });
        },

        initLiveBlogging: function() {
            common.mediator.on('page:article:ready', function(config, context) {
                if (config.page.isLive) {
                    var a = new AutoUpdate({
                        path: function() {
                            var id = context.querySelector('.article-body .block').id,
                                path = window.location.pathname;
                           return path + '.json' + '?lastUpdate=' + id;
                        },
                        delay: 60000,
                        attachTo: context.querySelector(".article-body"),
                        switches: config.switches,
                        manipulationType: 'prepend'
                    }).init();
                }
                if (config.page.isLiveBlog) {
                    var lf = new LiveFilter(context).init();

                    if (config.switches.liveSummary) {
                        var ls = new LiveSummary(context).init();
                    }
                }
            });
        },

        initDiscussion: function() {
            common.mediator.on('page:article:ready', function(config, context) {
                if (config.page.commentable) {
                    var discussionArticle = new Discussion({
                        id: config.page.shortUrl,
                        context: context,
                        config: config
                    }).init();
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
                                summaryElement: '.article-headline',
                                scorecardElement: '.article-headline',
                                summaryManipulation: 'after',
                                scorecardManipulation: 'after' };
                    Cricket.cricketArticle(config, context, options);
                }
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
        }
        common.mediator.emit("page:article:ready", config, context);
    };

    return {
        init: ready
    };

});
