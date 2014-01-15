/*global guardian:true */
define([
    'domReady',
    'common/utils/mediator',
    'common/utils/ajax',
    'common/utils/detect',
    
    'common/modules/analytics/errors',
    'common/modules/ui/fonts',
    'common/modules/router',
    'common/utils/config',
    'common/modules/adverts/userAdTargeting',
    'common/modules/discussion/api',

    'common/bootstraps/common',
    'common/bootstraps/tag',
    'common/bootstraps/section',
    'common/bootstraps/imagecontent',
    
    'common/bootstraps/facia',
    'common/bootstraps/football',
    'common/bootstraps/article',
    'common/bootstraps/video',
    'common/bootstraps/gallery',
    'common/bootstraps/interactive',
    'common/bootstraps/identity'
], function (
    domReady,
    mediator,
    ajax,
    detect,

    Errors,
    Fonts,
    Router,
    config,
    UserAdTargeting,
    DiscussionApi,

    bootstrapCommon,
    Tag,
    Section,
    ImageContent,
    Facia,
    Football,
    Article,
    Video,
    Gallery,
    Interactive,
    Identity
) {

    var modules = {

        initialiseAjax: function(config) {
            ajax.init(config);
        },

        initialiseDiscussionApi: function(config) {
            DiscussionApi.init(config);
        },

        attachGlobalErrorHandler: function (config) {
            if (!config.switches.clientSideErrors) {
                return false;
            }
            var e = new Errors({
                window: window,
                isDev: config.page.isDev,
                beaconUrl: config.page.beaconUrl
            });
            e.init();
            mediator.on('module:error', e.log);
        },

        loadFonts: function(config, ua) {
            if (config.switches.webFonts && !guardian.shouldLoadFontsAsynchronously) {
                var fileFormat = detect.getFontFormatSupport(ua),
                    fontStyleNodes = document.querySelectorAll('[data-cache-name].initial');
                var f = new Fonts(fontStyleNodes, fileFormat);
                f.loadFromServerAndApply();
            }
        },

        initId: function (config, context) {
            Identity.init(config, context);
        },

        initUserAdTargeting : function () {
            UserAdTargeting.requestUserSegmentsFromId();
        }
    };

    var routes = function() {
        domReady(function() {
            var context = document.getElementById('preload-1');

            modules.initialiseAjax(config);
            modules.initialiseDiscussionApi(config);
            modules.attachGlobalErrorHandler(config);
            modules.loadFonts(config, navigator.userAgent);
            modules.initId(config, context);
            modules.initUserAdTargeting();

            var pageRoute = function(config, context) {

                // We should rip out this router:
                var r = new Router();

                bootstrapCommon.init(config, context);

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

                if(config.page.contentType === 'Article') {
                    Article.init(config, context);
                }

                if (config.page.contentType === 'Video') {
                    Video.init(config, context);
                }

                if (config.page.contentType === 'Gallery') {
                    Gallery.init(config, context);
                }

                if (config.page.contentType === 'Interactive') {
                    Interactive.init(config, context);
                }

                if (config.page.contentType === 'Tag') {
                    Tag.init(config, context);
                }

                if (config.page.contentType === 'Section' && !config.page.isFront) {
                    Section.init(config, context);
                }

                if (config.page.contentType === 'ImageContent') {
                    ImageContent.init(config, context);
                }

                //Kick it all off
                r.init();
            };

            mediator.on('page:ready', pageRoute);
            mediator.emit('page:ready', config, context);
        });
    };

    return {
        go: routes
    };

});
