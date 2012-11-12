define([
    "domReady",
    "modules/router",
    "bootstraps/common",
    "bootstraps/front",
    "bootstraps/football",
    "bootstraps/article"
], function (
    domReady,
    Router,
    Common,
    Front,
    Football,
    Article
) {

    var routes = function(config, userPrefs) {
        domReady(function() {
            var r = new Router();

            //Init all common modules first
            Common.init(config, userPrefs);

            //Fronts
            r.get('/', function(req) { Front.init(req, config, userPrefs); });
            r.get('/sport', function(req) { Front.init(req, config, userPrefs); });
            r.get('/culture', function(req) { Front.init(req, config, userPrefs); });

            //Football
            r.get('/football', function(req) { Football.init(req, config, userPrefs); });
            r.get('/football/:page', function(req) { Football.init(req, config, userPrefs); });
            r.get('/football/:tag/:action', function(req) { Football.init(req, config, userPrefs); });

            //Articles
            if(config.page.contentType === "Article") {
                Article.init({url: window.location.pathName}, config, userPrefs);
            }

            //Kick it all off
            r.init();
        });
    };

    return {
        go: routes
    };

});
