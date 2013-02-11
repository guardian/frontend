define([
    "common",

    "modules/expandable",
    "modules/autoupdate",
    "modules/matchnav",
    "modules/analytics/reading",
    "modules/story-package"
], function (
    common,
    Expandable,
    AutoUpdate,
    MatchNav,
    Reading,
    StoryPackage
) {

    var modules = {

        matchNav: function(config){
            var teamIds = config.referencesOfType('paFootballTeam');
            var isRightTypeOfContent = config.hasTone("Match reports") || config.hasTone("Minute by minutes");

            if(teamIds.length === 2 && isRightTypeOfContent){
                var url = "/football/api/match-nav/";
                            url += config.webPublicationDateAsUrlPart() + "/";
                            url += teamIds[0] + "/" + teamIds[1];
                            url += "?currentPage=" + encodeURIComponent(config.page.pageId);
                new MatchNav().load(url);
            }
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
        },

    };

    var ready = function(config) {
        var storyPackageName = localStorage.getItem('gu.storypackage') || '';

        if (!storyPackageName) {
            for (var key in config.switches) {
                if (config.switches[key] && key.match(/storytelling(\w+)/)) {
                    storyPackageName = key.match(/storytelling(\w+)/)[1];
                    break;
                }
            }
        }
        storyPackageName = storyPackageName.toLowerCase();

        if (storyPackageName) {
            var story = new StoryPackage(config, storyPackageName).init();
        } else if (!config.page.hasStoryPackage) {
            common.mediator.emit("modules:related:load");
        }

        if (config.page.isLive) {
            modules.initLiveBlogging(config.switches);
        }

        if(config.page.section === "football") {
            modules.matchNav(config);
        }
    };

    // If you can wait for load event, do so.
    var defer = function(config) {
        common.deferToLoadEvent(function() {
            modules.logReading(config);
        });
    };

    var init = function (req, config) {
        ready(config);
        defer(config);
    };


    return {
        init: init
    };

});

