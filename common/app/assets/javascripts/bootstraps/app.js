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
    All,
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
            var r = new Router();

            var pageRoute = function(config) {
                //Fronts
                r.get('/', function(req) { Front.init(req, config); });
                r.get('/sport', function(req) { Front.init(req, config); });
                r.get('/culture', function(req) { Front.init(req, config); });

                //Football
                r.get('/football', function(req) { Football.init(req, config); });
                r.get('/football/:action', function(req) { Football.init(req, config); });
                r.get('/football/:action/:year/:month/:day', function(req) { Football.init(req, config); });
                r.get('/football/:tag/:action', function(req) { Football.init(req, config); });
                r.get('/football/:tag/:action/:year/:month/:day', function(req) { Football.init(req, config); });

                //Articles
                if(config.page.contentType === "Article") {
                    Article.init({url: window.location.pathName}, config);
                }

                if (config.page.contentType === "Video") {
                    Video.init({url: window.location.pathName}, config);
                }

                if (config.page.contentType === "Gallery") {
                    Gallery.init({url: window.location.pathName}, config);
                }

                r.get('/stories/:id', function(req) { Story.init(req, config);});

                //Kick it all off
                r.init();
            };

            // Init all common "run once" modules first
            All.runOnce(config);

            // Bindings
            common.mediator.on('page:ready', All.pageView);
            common.mediator.on('page:ready', pageRoute);

            // Emit the initial synthetic domReady
            common.mediator.emit('page:ready', config);

        });
    };

    return {
        go: routes
    };

});
