define([
    'qwery',
    'raven',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/user-timing',
    'bootstraps/article',
    'bootstraps/common',
    'bootstraps/gallery',
    'bootstraps/liveblog',
    'bootstraps/media',
    'bootstraps/profile',
    'bootstraps/sport',
    'common/modules/experiments/tests/save-for-later'
], function (
    qwery,
    raven,
    config,
    detect,
    mediator,
    userTiming,
    article,
    common,
    gallery,
    liveBlog,
    media,
    profile,
    sport,
    SaveForLaterTest
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

            if (config.switches.abSaveForLater
                && config.page.section === 'identity'
                && config.page.pageId === '/saved-for-later') {
                new SaveForLaterTest().variants[0].test();
            }

            bootstrapContext('common', common);

            // Front
            if (config.page.isFront) {
                require(['bootstraps/facia'], function (facia) {
                    bootstrapContext('facia', facia);
                });
            }

            if (config.page.section === 'lifeandstyle' && config.page.series === 'Sudoku') {
                require(['bootstraps/sudoku'], function (sudoku) {
                    bootstrapContext('sudoku', sudoku);
                });
            }

            if (config.page.contentType === 'Article') {
                require(['bootstraps/image-content'], function (imageContent) {
                    bootstrapContext('article', article);
                    bootstrapContext('article : image-content', imageContent);
                });
            }

            if (config.page.contentType === 'LiveBlog') {
                require(['bootstraps/image-content'], function (imageContent) {
                    bootstrapContext('liveBlog', liveBlog);
                    bootstrapContext('liveBlog : image-content', imageContent);
                });
            }

            if (config.isMedia || qwery('video, audio').length) {
                bootstrapContext('media', media);
            }

            if (config.page.contentType === 'Gallery') {
                require(['bootstraps/image-content'], function (imageContent) {
                    bootstrapContext('gallery', gallery);
                    bootstrapContext('gallery : image-content', imageContent);
                });
            }

            if (config.page.contentType === 'ImageContent') {
                require(['bootstraps/image-content'], function (imageContent) {
                    bootstrapContext('image-content', imageContent);
                });
            }

            if (config.page.section === 'football') {
                require(['bootstraps/football'], function (football) {
                    bootstrapContext('footbal', football);
                });
            }

            if (config.page.section === 'sport') {
                bootstrapContext('sport', sport);
            }

            if (config.page.section === 'identity') {
                bootstrapContext('profile', profile);
            }

            if (config.page.isPreferencesPage) {
                require(['bootstraps/preferences'], function (preferences) {
                    bootstrapContext('preferences', preferences);
                });
            }

            if (config.page.pageId === 'help/accessibility-help') {
                require(['bootstraps/accessibility'], function (accessibility) {
                    bootstrapContext('accessibility', accessibility);
                });
            }

            // Mark the end of synchronous execution.
            userTiming.mark('App End');
        };

    return {
        go: routes
    };

});
