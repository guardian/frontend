define('bootstraps/app', [
    "common",
    "domReady",
    "ajax",
    'modules/detect',
    'modules/errors',
    'modules/fonts',
    'modules/debug',
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
    ajax,
    detect,
    Errors,
    Fonts,
    Debug,
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

    var modules = {

        initialiseAjax: function(config) {
            ajax.init(config.page.ajaxUrl);
        },

        attachGlobalErrorHandler: function (config) {
            var e = new Errors({
                window: window,
                isDev: config.page.isDev
            });
            e.init();
            common.mediator.on("module:error", e.log);
        },

        loadFonts: function(config, ua) {
            if(config.switches.webFonts) {
                var fileFormat = detect.getFontFormatSupport(ua),
                    fontStyleNodes = document.querySelectorAll('[data-cache-name].initial');
                var f = new Fonts(fontStyleNodes, fileFormat);
                f.loadFromServerAndApply();
            }
        },

        showDebug: function () {
            new Debug().show();
        }
    };

    var routes = function(rawConfig) {
        var config = pageConfig(rawConfig);

        domReady(function() {
            var context = document.getElementById('swipepage-1');

            modules.initialiseAjax(config);
            modules.attachGlobalErrorHandler(config);
            modules.loadFonts(config, navigator.userAgent);
            modules.showDebug();

            var pageRoute = function(config, context) {

                // We should rip out this router:
                var r = new Router();

                bootstrapCommon.init(config, context);

                //Fronts
                r.get('/', function(req) {        Front.init(config, context); });
                r.get('/sport', function(req) {   Front.init(config, context); });
                r.get('/culture', function(req) { Front.init(config, context); });

                //Football
                r.get('/football', function(req) {                                Football.init(req, config, context); });
                r.get('/football/:action', function(req) {                        Football.init(req, config, context); });
                r.get('/football/:action/:year/:month/:day', function(req) {      Football.init(req, config, context); });
                r.get('/football/:tag/:action', function(req) {                   Football.init(req, config, context); });
                r.get('/football/:tag/:action/:year/:month/:day', function(req) { Football.init(req, config, context); });

                r.get('/stories/:id', function(req) { Story.init(config, context);});

                if(config.page.contentType === "Article") {
                    Article.init(config, context);
                }

                if (config.page.contentType === "Video") {
                    Video.init(config, context);
                }

                if (config.page.contentType === "Gallery") {
                    Gallery.init(config, context);
                }

                //Kick it all off
                r.init();
            };

            common.mediator.on('page:ready', pageRoute);
            
            common.mediator.emit('page:ready', config, context);
        });
    };

    return {
        go: routes
    };

});