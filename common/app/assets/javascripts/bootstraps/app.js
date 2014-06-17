/*global guardian:true */
define([
    'qwery',
    'common/utils/mediator',
    'common/utils/ajax',
    'common/utils/detect',
    'common/utils/config',
    'common/utils/context',
    'common/utils/userTiming',

    'common/modules/analytics/errors',
    'common/modules/ui/fonts',
    'common/modules/adverts/userAdTargeting',
    'common/modules/discussion/api',

    'common/bootstraps/common',
    'common/bootstraps/tag',
    'common/bootstraps/section',
    'common/bootstraps/imagecontent',

    'common/bootstraps/football',
    'common/bootstraps/article',
    'common/bootstraps/video',
    'common/bootstraps/gallery',
    'common/bootstraps/identity'
], function (
    qwery,
    mediator,
    ajax,
    detect,
    config,
    Context,
    userTiming,

    Errors,
    Fonts,
    UserAdTargeting,
    DiscussionApi,

    bootstrapCommon,
    Tag,
    Section,
    ImageContent,

    Football,
    Article,
    Video,
    Gallery,
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
                isDev: config.page.isDev,
                buildNumber: config.page.buildNumber
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
        userTiming.mark('App Begin');

        var context = document.getElementById('js-context');
        Context.set(context);

        modules.initialiseAjax(config);
        modules.initialiseDiscussionApi(config);
        modules.attachGlobalErrorHandler(config);
        modules.loadFonts(config, navigator.userAgent);
        modules.initId(config, context);
        modules.initUserAdTargeting();

        var pageRoute = function(config, context) {
            bootstrapCommon.init(config, context);

            // Front
            if (config.page.isFront) {
                require('bootstraps/facia', function(facia) {
                    facia.init(config, context);
                });
            }

            if(config.page.contentType === 'Article') {
                Article.init(config, context);
            }

            if (config.page.contentType === 'Video' || qwery('video').length) {
                Video.init(config, context);
            }

            if (config.page.contentType === 'Gallery') {
                Gallery.init(config, context);
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

            if (config.page.section === 'football') {
                // Kick it all off
                Football.init();
            }
        };

        mediator.on('page:ready', pageRoute);
        mediator.emit('page:ready', config, context);

        // Mark the end of synchronous execution.
        userTiming.mark('App End');
    };

    return {
        go: routes
    };

});
