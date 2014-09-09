/*global guardian:true */
define([
    'raven',
    'qwery',
    'common/utils/mediator',
    'common/utils/detect',
    'common/utils/config',
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
    'common/bootstraps/profile',
    'common/bootstraps/sport'
], function (
    raven,
    qwery,
    mediator,
    detect,
    config,
    userTiming,

    Fonts,
    userAdTargeting,
    discussionApi,

    bootstrapCommon,
    tag,
    section,
    football,
    article,
    liveBlog,
    media,
    gallery,
    identity,
    profile,
    sport
) {

    var bootstrapContext = function(featureName, boostrap) {
            raven.context(
                {
                    tags: {
                        feature: featureName
                    }
                },
                function() {
                    boostrap.init(config);
                }
            );
        },
        modules = {
            initialiseDiscussionApi: function() {
                discussionApi.init(config);
            },

            loadFonts: function(ua) {
                if (config.switches.webFonts && !guardian.shouldLoadFontsAsynchronously) {
                    var fileFormat = detect.getFontFormatSupport(ua),
                        fontStyleNodes = document.querySelectorAll('[data-cache-name].initial');
                    var f = new Fonts(fontStyleNodes, fileFormat);
                    f.loadFromServerAndApply();
                }
            },

            initId: function () {
                identity.init(config);
            },

            initUserAdTargeting : function () {
                userAdTargeting.requestUserSegmentsFromId();
            }
        };

    var routes = function() {
        userTiming.mark('App Begin');

        modules.initialiseDiscussionApi();
        modules.loadFonts(navigator.userAgent);
        modules.initId();
        modules.initUserAdTargeting();

        var pageRoute = function() {
            bootstrapContext('common', bootstrapCommon);

            // Front
            if (config.page.isFront) {
                require('bootstraps/facia', function(facia) {
                    bootstrapContext('facia', facia);
                });
            }

            if(config.page.contentType === 'Article') {
                bootstrapContext('article', article);
            }

            if(config.page.contentType === 'LiveBlog') {
                bootstrapContext('liveBlog', liveBlog);
            }

            if (config.isMedia || qwery('video, audio').length) {
                bootstrapContext('media', media);
            }

            if (config.page.contentType === 'Gallery') {
                bootstrapContext('gallery', gallery);
            }

            if (config.page.contentType === 'Tag') {
                bootstrapContext('tag', tag);
            }

            if (config.page.contentType === 'Section' && !config.page.isFront) {
                bootstrapContext('section', section);
            }

            if (config.page.section === 'football') {
                bootstrapContext('footbal', football);
            }

            if (config.page.section === 'sport') {
                bootstrapContext('sport', sport);
            }

            if (config.page.section === 'identity') {
                bootstrapContext('profile', profile);
            }
        };

        mediator.on('page:ready', pageRoute);
        mediator.emit('page:ready', config);

        // Mark the end of synchronous execution.
        userTiming.mark('App End');
    };

    return {
        go: routes
    };

});
