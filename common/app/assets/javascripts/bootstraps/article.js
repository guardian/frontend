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

        matchNav: function(){
            new MatchNav().load();
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

        modules.matchNav();

    };

    return {
        init: ready
    };

});

