define([
    "common",

    "modules/expandable",
    "modules/autoupdate",
    "modules/matchnav"
], function (
    common,
    Expandable,
    AutoUpdate,
    MatchNav
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

        related: function(config){
            var host = config.page.coreNavigationUrl,
                pageId = config.page.pageId,
                edition = config.page.edition;

            var url =  host + '/related/' + pageId;
            common.mediator.emit("modules:related:load", [url]);
        },

        initLiveBlogging: function(switches) {
            var a = new AutoUpdate({
                path: window.location.pathname,
                delay: 60000,
                attachTo: document.querySelector(".article-body"),
                switches: switches
            }).init();
        }
    };


    var ready = function(req, config) {

        if (config.page.isLive) {
            modules.initLiveBlogging(config.switches);
        }

        if (config.page.showInRelated) {
            modules.related(config);
        }

        if(config.page.section === "football") {
            modules.matchNav(config);
        }
    };

    return {
        init: ready
    };

});

