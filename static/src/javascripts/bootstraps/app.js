/*global guardian:true */
define([
    'raven',
    'qwery',
    'common/utils/mediator',
    'common/utils/detect',
    'common/utils/config',
    'common/utils/user-timing',

    'common/modules/ui/fonts',
    'common/modules/commercial/user-ad-targeting',

    'bootstraps/common',
    'bootstraps/tag',
    'bootstraps/section',
    'bootstraps/football',
    'bootstraps/article',
    'bootstraps/liveblog',
    'bootstraps/media',
    'bootstraps/gallery',
    'bootstraps/identity',
    'bootstraps/profile',
    'bootstraps/sport'
], function (
    raven,
    qwery,
    mediator,
    detect,
    config,
    userTiming,

    Fonts,
    userAdTargeting,

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

    var bootstrapContext = function (featureName, boostrap) {
            raven.context(
                {
                    tags: {
                        feature: featureName
                    }
                },
                function () {
                    boostrap.init();
                }
            );
        },
        modules = {

            loadFonts: function (ua) {
                if (config.switches.webFonts && !guardian.shouldLoadFontsAsynchronously) {
                    var fileFormat = detect.getFontFormatSupport(ua),
                        fontStyleNodes = document.querySelectorAll('[data-cache-name].initial'),
                        f = new Fonts(fontStyleNodes, fileFormat);
                    f.loadFromServerAndApply();
                }
            },

            initId: function () {
                identity.init(config);
            },

            initUserAdTargeting: function () {
                userAdTargeting.requestUserSegmentsFromId();
            }
        },

        routes = function () {
            userTiming.mark('App Begin');

            modules.loadFonts(navigator.userAgent);
            modules.initId();
            modules.initUserAdTargeting();

            bootstrapContext('common', bootstrapCommon);

            // Front
            if (config.page.isFront) {
                require('bootstraps/facia', function (facia) {
                    bootstrapContext('facia', facia);
                });
            }

            if (config.page.section === 'crosswords') {
                require(['bootstraps/crosswords'], function (crosswords) {
                    bootstrapContext('crosswords', crosswords);
                });
            }

            if (config.page.contentType === 'Article') {
                bootstrapContext('article', article);
            }

            if (config.page.contentType === 'LiveBlog') {
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

            if (config.page.isPreview) {
                // lazy load this only if on the preview server
                require('bootstraps/preview', function (preview) {
                    bootstrapContext('preview', preview);
                });
            }

            // Mark the end of synchronous execution.
            userTiming.mark('App End');
        };

    return {
        go: routes
    };

});
