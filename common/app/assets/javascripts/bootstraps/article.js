define([
    "common",

    "modules/related",
    "modules/expandable",
    "modules/autoupdate"
], function (
    common,
    Related,
    Expandable,
    AutoUpdate
) {

    var modules = {

        transcludeRelated: function (config){
            var host = config.page.coreNavigationUrl,
                pageId = config.page.pageId,
                showInRelated = config.page.showInRelated,
                edition = config.page.edition;

            var url =  host + '/related/' + edition + '/' + pageId,
                 hasStoryPackage = !document.getElementById('js-related'),
                 relatedExpandable = new Expandable({ id: 'related-trails', expanded: false });

            if (hasStoryPackage) {
                relatedExpandable.init();
            }

            if (!hasStoryPackage && showInRelated) {
                common.mediator.on('modules:related:render', relatedExpandable.init);
                new Related(document.getElementById('js-related')).load(url);
            }
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
        modules.transcludeRelated(config);

        if (config.page.isLive) {
            modules.initLiveBlogging(config.switches);
        }
        
    };

    return {
        init: ready
    };

});
