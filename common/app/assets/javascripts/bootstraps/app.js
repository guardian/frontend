/*global guardian:true */
define('bootstraps/app', [
    'common',
    'qwery',
    'domReady',
    'utils/ajax',
    'utils/detect',
    
    'modules/analytics/errors',
    'modules/analytics/livestats',
    'modules/ui/fonts',
    'modules/router',
    'modules/experiments/ab',
    'modules/pageconfig',
    'modules/adverts/userAdTargeting',
    'modules/discussion/api',
    'modules/identity/api',

    'bootstraps/common',
    'bootstraps/tag',
    'bootstraps/section',
    'bootstraps/imagecontent',
    
    'bootstraps/facia',
    'bootstraps/football',
    'bootstraps/article',
    'bootstraps/video',
    'bootstraps/gallery',
    'bootstraps/interactive',
    'bootstraps/identity'
], function (
    common,
    qwery,
    domReady,
    ajax,
    detect,

    Errors,
    LiveStats,
    Fonts,
    Router,
    ab,
    pageConfig,
    UserAdTargeting,
    DiscussionApi,
    IdApi,

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
            common.mediator.on('module:error', e.log);
        },
        
        liveStats: function (config) {
            if (!config.switches.liveStats) {
                return false;
            }
            new LiveStats({ beaconUrl: config.page.beaconUrl }).log();
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

        initId : function (config) {
            IdApi.init(config);
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
            modules.initialiseDiscussionApi(config);
            modules.initialiseAbTest(config);
            modules.attachGlobalErrorHandler(config);
            modules.loadFonts(config, navigator.userAgent);
            modules.initId(config);
            modules.initUserAdTargeting();
            modules.liveStats(config);

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

                if (config.page.section === 'identity') {
                    Identity.init(config, context);
                }

                if (config.page.contentType === 'ImageContent') {
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
