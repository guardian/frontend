define([
    "common",

    "modules/expandable",
    "modules/autoupdate",
    "modules/matchnav",
    "modules/analytics/reading",
    "modules/story/experiment",
    "modules/accordion"
], function (
    common,
    Expandable,
    AutoUpdate,
    MatchNav,
    Reading,
    Experiment,
    Accordion
) {

    var modules = {

        matchNav: function(){
            var matchNav = new MatchNav();
            common.mediator.on('page:ready', function(config, context) {
                var teamIds = config.referencesOfType('paFootballTeam');
                var isRightTypeOfContent = config.hasTone("Match reports") || config.hasTone("Minute by minutes");

                if(teamIds.length === 2 && isRightTypeOfContent){
                    var url = "/football/api/match-nav/";
                        url += config.webPublicationDateAsUrlPart() + "/";
                        url += teamIds[0] + "/" + teamIds[1];
                        url += "?currentPage=" + encodeURIComponent(config.page.pageId);

                    matchNav.load(url, context);
                }
            });
        },

        initLiveBlogging: function(switches) {
            var a = new AutoUpdate({
                path: window.location.pathname,
                delay: 60000,
                attachTo: document.querySelector(".article-body"),
                switches: switches
            }).init();
        },

        logReading: function(config) {
            var wordCount = config.page.wordCount;
            if(wordCount !== "") {
                
                var reader = new Reading({
                    id: config.page.pageId,
                    wordCount: parseInt(config.page.wordCount, 10),
                    el: document.querySelector('.article-body'),
                    ophanUrl: config.page.ophanUrl
                });

                reader.init();
            }
        }
    };

    var ready = function(config, context) {

        common.mediator.emit("page:article:ready", config, context);

        if (config.page.isLive) {
            modules.initLiveBlogging(config.switches);
        }

        if(config.page.section === "football") {
            modules.matchNav(config, context);
        }

    };

    // If you can wait for load event, do so.
    var defer = function(config, context) {
        common.deferToLoadEvent(function() {
            modules.logReading(config);
        });
    };

    var init = function (req, config, context) {
        ready(config, context);
        defer(config);
    };


    return {
        init: init
    };

});

