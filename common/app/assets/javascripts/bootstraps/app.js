define('bootstraps/app', [
    "common",
    "domReady",
    "modules/router",
    "bootstraps/common",
    "bootstraps/front",
    "bootstraps/football",
    "bootstraps/article",
    "bootstraps/video",
    "bootstraps/gallery",
    "bootstraps/story",
    "modules/pageconfig"
], function (
    common,
    domReady,
    Router,
    bootstrapCommon,
    Front,
    Football,
    Article,
    Video,
    Gallery,
    Story,
    pageConfig
) {

    var routes = function(rawConfig) {
        var config = pageConfig(rawConfig);

        domReady(function() {
            var r = new Router(),
                context = document.getElementById('container');

            //Fronts
            r.get('/', function(req) {        Front.init(req, config, context); });
            r.get('/sport', function(req) {   Front.init(req, config, context); });
            r.get('/culture', function(req) { Front.init(req, config, context); });

            //Football
            r.get('/football', function(req) {                                Football.init(req, config, context); });
            r.get('/football/:action', function(req) {                        Football.init(req, config, context); });
            r.get('/football/:action/:year/:month/:day', function(req) {      Football.init(req, config, context); });
            r.get('/football/:tag/:action', function(req) {                   Football.init(req, config, context); });
            r.get('/football/:tag/:action/:year/:month/:day', function(req) { Football.init(req, config, context); });

            r.get('/stories/:id', function(req) { Story.init(req, config, context);});

            var pageRoute = function(config, context) {
                //Articles
                if(config.page.contentType === "Article") {
                    Article.init({url: window.location.pathName}, config, context);
                }

                if (config.page.contentType === "Video") {
                    Video.init({url: window.location.pathName}, config, context);
                }

                if (config.page.contentType === "Gallery") {
                    Gallery.init({url: window.location.pathName}, config, context);
                }

                //Kick it all off
                r.init();
            };

            bootstrapCommon.runOnce(config);

            common.mediator.on('page:ready', bootstrapCommon.pageReady);
            common.mediator.on('page:ready', pageRoute);

            common.mediator.emit('page:ready', config, context);
        });
    };

    return {
        go: routes
    };

});