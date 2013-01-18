define(["modules/analytics/video"], function(Videostream) {

    var modules = {
        initAnalytics: function (pageName) {
            var v = new Videostream(pageName);

            v.init();
        }
    };

    var init = function(req, config) {
        modules.initAnalytics(config.page.analyticsName);
    };

    return {
        init: init
    };
});