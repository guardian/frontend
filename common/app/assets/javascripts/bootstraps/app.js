define('bootstraps/app', [
    "common",
    "domReady",
    "ajax",
    'modules/detect',
    'modules/errors',
    'modules/analytics/canary',
    'modules/fonts',
    'modules/debug',
    "modules/router",
    "bootstraps/common",
    "bootstraps/front",
    "bootstraps/football",
    "bootstraps/article",
    "bootstraps/video",
    "bootstraps/gallery",
    "bootstraps/interactive",
    "modules/experiments/ab",
    "modules/pageconfig",
    "bootstraps/tag"
], function (
    common,
    domReady,
    ajax,
    detect,
    Errors,
    Canary,
    Fonts,
    Debug,
    Router,
    bootstrapCommon,
    Front,
    Football,
    Article,
    Video,
    Gallery,
    Interactive,
    ab,
    pageConfig,
    Tag
) {

    var modules = {

        initialiseAjax: function(config) {
            ajax.init(config);
        },

        attachGlobalErrorHandler: function (config) {
            var e = new Errors({
                window: window,
                isDev: config.page.isDev
            });
            e.init();
            common.mediator.on("module:error", e.log);
        },
       
       // RUM on features
       sendInTheCanary: function (config) {
            var c = new Canary({
                isDev: config.page.isDev
            });
            c.init();
        },
    
        initialiseAbTest: function (config) {
            ab.segment(config);
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
            var context = document.getElementById('preload-1');
            
            modules.initialiseAjax(config);
            modules.initialiseAbTest(config);
            modules.attachGlobalErrorHandler(config);
            modules.sendInTheCanary(config);
            modules.loadFonts(config, navigator.userAgent);
            modules.showDebug();

            var pageRoute = function(config, context) {

                // We should rip out this router:
                var r = new Router();

                bootstrapCommon.init(config, context);


                //Fronts
                if(config.page.isFront){
                    Front.init(config, context);
                }

                //Football
                r.get('/football', function(req) {                                Football.init(req, config, context); });
                r.get('/football/:action', function(req) {                        Football.init(req, config, context); });
                r.get('/football/:action/:year/:month/:day', function(req) {      Football.init(req, config, context); });
                r.get('/football/:tag/:action', function(req) {                   Football.init(req, config, context); });
                r.get('/football/:tag/:action/:year/:month/:day', function(req) { Football.init(req, config, context); });

                if(config.page.contentType === "Article") {
                    Article.init(config, context);
                }

                if (config.page.contentType === "Video") {
                    Video.init(config, context);
                }

                if (config.page.contentType === "Gallery") {
                    Gallery.init(config, context);
                }

                if (config.page.contentType === "Interactive") {
                    Interactive.init(config, context);
                }

                if (config.page.contentType === "Tag") {
                    Tag.init(config, context);
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
