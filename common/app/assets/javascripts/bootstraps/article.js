define([
    "common",

    "modules/autoupdate",
    "modules/matchnav",
    "modules/analytics/reading"
], function (
    common,
    AutoUpdate,
    MatchNav,
    Reading
) {

    var modules = {

        matchNav: function(){
            var matchNav = new MatchNav();
            common.mediator.on('page:article:ready', function(config, context) {
                if(config.page.section === "football") {
                    var teamIds = config.referencesOfType('paFootballTeam');
                    var isRightTypeOfContent = config.hasTone("Match reports") || config.hasTone("Minute by minutes");

                    if(teamIds.length === 2 && isRightTypeOfContent){
                        var url = "/football/api/match-nav/";
                            url += config.webPublicationDateAsUrlPart() + "/";
                            url += teamIds[0] + "/" + teamIds[1];
                            url += "?currentPage=" + encodeURIComponent(config.page.pageId);

                        matchNav.load(url, context);
                    }
                }
            });
        },

        initLiveBlogging: function() {
            common.mediator.on('page:article:ready', function(config, context) {
                if (config.page.isLive) {
                    var a = new AutoUpdate({
                        path: window.location.pathname,
                        delay: 60000,
                        attachTo: context.querySelector(".article-body"),
                        switches: config.switches
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
        }
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            common.lazyLoadCss('article', config);
            modules.matchNav();
            modules.initLiveBlogging();
            modules.logReading();
        }
        common.mediator.emit("page:article:ready", config, context);
    };

    return {
        init: ready
    };

});
