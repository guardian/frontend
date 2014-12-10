define([
    'qwery',
    'raven',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/user-timing',
    'bootstraps/article',
    'bootstraps/common',
    'bootstraps/football',
    'bootstraps/gallery',
    'bootstraps/image-content',
    'bootstraps/liveblog',
    'bootstraps/media',
    'bootstraps/profile',
    'bootstraps/section',
    'bootstraps/sport',
    'bootstraps/tag'
], function (
    qwery,
    raven,
    config,
    detect,
    mediator,
    userTiming,
    article,
    common,
    football,
    gallery,
    imageContent,
    liveBlog,
    media,
    profile,
    section,
    sport,
    tag
) {

    var bootstrapContext = function (featureName, boostrap) {
            raven.context(
                { tags: { feature: featureName } },
                boostrap.init,
                []
            );
        },

        routes = function () {
            userTiming.mark('App Begin');

            bootstrapContext('common', common);

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

            if (config.page.contentType === 'ImageContent') {
                bootstrapContext('image-content', imageContent);
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
