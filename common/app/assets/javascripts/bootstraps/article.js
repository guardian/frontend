define([
    "common",

    "modules/expandable",
    "modules/autoupdate"
], function (
    common,
    Expandable,
    AutoUpdate
) {

    var modules = {

        related: function(config){
            var host = config.page.coreNavigationUrl,
                pageId = config.page.pageId,
                edition = config.page.edition;

            var url =  host + '/related/' + edition + '/' + pageId;
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
    };

    return {
        init: ready
    };

});
