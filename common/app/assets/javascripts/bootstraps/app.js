/*global guardian:true */
define('bootstraps/app', [
    "qwery",
    "common",
    "domReady",
    "ajax",
    'modules/detect',
    'modules/errors',
    'modules/fonts',
    'modules/debug',
    "modules/router",
    "bootstraps/common",
    "bootstraps/facia",
    "bootstraps/football",
    "bootstraps/article",
    "bootstraps/video",
    "bootstraps/gallery",
    "bootstraps/interactive",
    "bootstraps/identity",
    "modules/experiments/ab",
    "modules/pageconfig",
    "bootstraps/tag",
    "bootstraps/section",
    "bootstraps/imagecontent",
    "modules/id",
    "modules/adverts/userAdTargeting"
], function (
    qwery,
    common,
    domReady,
    ajax,
    detect,
    Errors,
    Fonts,
    Debug,
    Router,
    bootstrapCommon,
    Facia,
    Football,
    Article,
    Video,
    Gallery,
    Interactive,
    Identity,
    ab,
    pageConfig,
    Tag,
    Section,
    ImageContent,
    Id,
    UserAdTargeting
) {

    var modules = {

        initialiseAjax: function(config) {
            ajax.init(config);
        },

        attachGlobalErrorHandler: function (config) {
            var e = new Errors({
                window: window,
                isDev: config.page.isDev,
                beaconUrl: config.page.beaconUrl
            });
            e.init();
            common.mediator.on("module:error", e.log);
        },

        initialiseAbTest: function (config) {
            var forceUserIntoTest = /^#ab/.test(window.location.hash);
            if (forceUserIntoTest) {
                var tokens = window.location.hash.replace('#ab-','').split('=');
                var test = tokens[0], variant = tokens[1];
                ab.forceSegment(test, variant);
            } else {
                ab.segment(config);
            }
        },

        loadFonts: function(config, ua) {
            if (config.switches.webFonts && !guardian.platformsGettingHintedFonts.test(ua)) {
                var fileFormat = detect.getFontFormatSupport(ua),
                    fontStyleNodes = document.querySelectorAll('[data-cache-name].initial');
                var f = new Fonts(fontStyleNodes, fileFormat);
                f.loadFromServerAndApply();
            }
        },

        showDebug: function () {
            new Debug().show();
        },

        initId : function (config) {
            Id.init(config);
        },

        initUserAdTargeting : function () {
            UserAdTargeting.requestUserSegmentsFromId();
        }
    };

    var routes = function(rawConfig) {
        var config = pageConfig(rawConfig);

        domReady(function() {
            var context = document.getElementById('preload-1'),
                contextHtml = context.cloneNode(false).innerHTML;

            modules.initialiseAjax(config);
            modules.initialiseAbTest(config);
            modules.attachGlobalErrorHandler(config);
            modules.loadFonts(config, navigator.userAgent);
            modules.showDebug();
            modules.initId(config);
            modules.initUserAdTargeting();

            var pageRoute = function(config, context, contextHtml) {

                // We should rip out this router:
                var r = new Router();

                bootstrapCommon.init(config, context, contextHtml);

                // Front
                if (config.page.isFront) {
                    Facia.init(config, context);
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

                if (config.page.contentType === "Section" && !config.page.isFront) {
                    Section.init(config, context);
                }

                if (config.page.section === "identity") {
                    Identity.init(config, context);
                }

                if (config.page.contentType === "ImageContent") {
                    ImageContent.init(config, context);
                }

                //Kick it all off
                r.init();
            };

            common.mediator.on('page:ready', pageRoute);
            common.mediator.emit('page:ready', config, context, contextHtml);
        });
    };

    return {
        go: routes
    };

});
