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
    './common',
    './sport',

    'enhanced-common'
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
    return function () {
        var bootstrapContext = function (featureName, bootstrap) {
            raven.context(
                { tags: { feature: featureName } },
                bootstrap.init,
                []
            );
        };


        userTiming.mark('App Begin');
        bootstrapContext('common', common);

        // Front
        if (config.page.isFront) {
            require(['bootstraps/enhanced/facia'], function (facia) {
                bootstrapContext('facia', facia);
            });
        }

        if (config.page.section === 'lifeandstyle' && config.page.series === 'Sudoku') {
            require(['bootstraps/enhanced/sudoku'], function (sudoku) {
                bootstrapContext('sudoku', sudoku);
            });
        }

        if (config.page.contentType === 'Article') {
            require(['bootstraps/enhanced/article', 'bootstraps/enhanced/image-content'], function (article, imageContent) {
                bootstrapContext('article', article);
                bootstrapContext('article : image-content', imageContent);
            });
        }

        if (config.page.contentType === 'Crossword' || config.page.pageId === 'offline-page') {
            require(['bootstraps/enhanced/crosswords'], function (crosswords) {
                bootstrapContext('crosswords', crosswords);
            });
        }

        if (config.page.contentType === 'LiveBlog') {
            require(['bootstraps/enhanced/liveblog', 'bootstraps/enhanced/image-content'], function (liveBlog, imageContent) {
                bootstrapContext('liveBlog', liveBlog);
                bootstrapContext('liveBlog : image-content', imageContent);
            });
        }

        if (config.isMedia || config.page.contentType === 'Interactive') {
            require(['bootstraps/enhanced/trail'], function (trail) {
                bootstrapContext('media : trail', {
                    init: trail
                });
            });
        }

        if (config.isMedia || qwery('video, audio').length) {
            require(['bootstraps/enhanced/media/main'], function (media) {
                bootstrapContext('media', media);
            });
        }

        if (config.page.contentType === 'Gallery') {
            require(['bootstraps/enhanced/gallery', 'bootstraps/enhanced/image-content'], function (gallery, imageContent) {
                bootstrapContext('gallery', gallery);
                bootstrapContext('gallery : image-content', imageContent);
            });
        }

        if (config.page.contentType === 'ImageContent') {
            require(['bootstraps/enhanced/image-content', 'bootstraps/enhanced/trail'], function (imageContent, trail) {
                bootstrapContext('image-content', imageContent);
                bootstrapContext('image-content : trail', {
                    init: trail
                });
            });
        }

        if (config.page.section === 'football') {
            require(['bootstraps/enhanced/football'], function (football) {
                bootstrapContext('football', football);
            });
        }

        if (config.page.section === 'sport') {
            // Leaving this here for now as it's a tiny bootstrap.
            bootstrapContext('sport', sport);
        }

        if (config.page.section === 'identity') {
            require(['bootstraps/enhanced/profile'], function (profile) {
                bootstrapContext('profile', profile);
            });
        }

        if (config.page.isPreferencesPage) {
            require(['bootstraps/enhanced/preferences'], function (preferences) {
                bootstrapContext('preferences', preferences);
            });
        }

        var isDev = window.location.hostname === 'localhost';
        if ((window.location.protocol === 'https:' || isDev)
            && config.page.section !== 'identity') {
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
            require(['bootstraps/enhanced/accessibility'], function (accessibility) {
                bootstrapContext('accessibility', accessibility);
            });
        }

        // Mark the end of synchronous execution.
        userTiming.mark('App End');
    }
});
