define([
    'fastdom',
    'bean',
    'qwery',
    'raven',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/user-timing',
    'bootstraps/common',
    'bootstraps/sport'
], function (
    fastdom,
    bean,
    qwery,
    raven,
    $,
    config,
    detect,
    mediator,
    userTiming,
    common,
    sport
) {

    var bootstrapContext = function (featureName, bootstrap) {
            raven.context(
                { tags: { feature: featureName } },
                bootstrap.init,
                []
            );
        },

        routes = function () {
            userTiming.mark('App Begin');
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
                require(['bootstraps/article', 'bootstraps/image-content'], function (article, imageContent) {
                    bootstrapContext('article', article);
                    bootstrapContext('article : image-content', imageContent);
                });
            }

            if (config.page.contentType === 'Crossword' || config.page.pageId === 'offline-page') {
                require(['bootstraps/crosswords'], function (crosswords) {
                    bootstrapContext('crosswords', crosswords);
                });
            }

            if (config.page.contentType === 'LiveBlog') {
                require(['bootstraps/liveblog', 'bootstraps/image-content'], function (liveBlog, imageContent) {
                    bootstrapContext('liveBlog', liveBlog);
                    bootstrapContext('liveBlog : image-content', imageContent);
                });
            }

            if (config.isMedia || config.page.contentType === 'Interactive') {
                require(['bootstraps/trail'], function (trail) {
                    bootstrapContext('media : trail', {
                        init: trail
                    });
                });
            }

            if (config.isMedia || qwery('video, audio').length) {
                require(['bootstraps/media'], function (media) {
                    bootstrapContext('media', media);
                });
            }

            if (config.page.contentType === 'Gallery') {
                require(['bootstraps/gallery', 'bootstraps/image-content'], function (gallery, imageContent) {
                    bootstrapContext('gallery', gallery);
                    bootstrapContext('gallery : image-content', imageContent);
                });
            }

            if (config.page.contentType === 'ImageContent') {
                require(['bootstraps/image-content', 'bootstraps/trail'], function (imageContent, trail) {
                    bootstrapContext('image-content', imageContent);
                    bootstrapContext('image-content : trail', {
                        init: trail
                    });
                });
            }

            if (config.page.section === 'football') {
                require(['bootstraps/football'], function (football) {
                    bootstrapContext('football', football);
                });
            }

            if (config.page.section === 'sport') {
                // Leaving this here for now as it's a tiny bootstrap.
                bootstrapContext('sport', sport);
            }

            if (config.page.section === 'identity') {
                require(['bootstraps/profile'], function (profile) {
                    bootstrapContext('profile', profile);
                });
            }

            if (config.page.isPreferencesPage) {
                require(['bootstraps/preferences'], function (preferences) {
                    bootstrapContext('preferences', preferences);
                });
            }

            if (window.location.protocol === 'https:') {
                var navigator = window.navigator;
                if (navigator && navigator.serviceWorker) {
                    navigator.serviceWorker.register('/service-worker.js');
                }
            }

            if (config.page.pageId === 'offline-page') {
                var $button = $('.js-open-crossword-btn');
                bean.on($button[0], 'click', function () {
                    fastdom.write(function () {
                        $('.js-crossword-container').removeClass('is-hidden');
                        $button.remove();
                    });
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
