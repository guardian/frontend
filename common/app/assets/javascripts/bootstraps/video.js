define(["modules/analytics/video"], function(Videostream) {

    var modules = {
        initAnalytics: function (config) {
            var v = new Videostream({
                id: config.page.id,
                el: document.querySelector('#player video'),
                ophanUrl: config.ophanUrl
            });

            v.init();
        }
    };

    var init = function(req, config) {
        modules.initAnalytics(config);
    };

    return {
        init: init
    };
});