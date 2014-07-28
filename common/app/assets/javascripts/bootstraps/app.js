/*global guardian:true */
define([
    'qwery',
    'common/utils/mediator',
    'common/utils/detect',
    'common/utils/config',
    'common/utils/context',
    'common/utils/userTiming',

    'common/modules/ui/fonts',
    'common/modules/commercial/user-ad-targeting',
    'common/modules/discussion/api',

    'common/bootstraps/common',
    'common/bootstraps/tag',
    'common/bootstraps/section',

    'common/bootstraps/football',
    'common/bootstraps/article',
    'common/bootstraps/liveblog',
    'common/bootstraps/media',
    'common/bootstraps/gallery',
    'common/bootstraps/identity',
    'common/bootstraps/profile'
], function (
    qwery,
    mediator,
    detect,
    config,
    Context,
    userTiming,

    Fonts,
    UserAdTargeting,
    DiscussionApi,

    bootstrapCommon,
    Tag,
    Section,

    Football,
    Article,
    LiveBlog,
    Media,
    Gallery,
    Identity,
    Profile
) {

    var modules = {

        initialiseDiscussionApi: function(config) {
            DiscussionApi.init(config);
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

        modules.initialiseDiscussionApi(config);
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

            if(config.page.contentType === 'LiveBlog') {
                LiveBlog.init(config, context);
            }

            if (config.isMedia || qwery('video, audio').length) {
                Media.init(config, context);
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

            if (config.page.section === 'football') {
                Football.init();
            }

            if (config.page.section === 'identity') {
                Profile.init();
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
