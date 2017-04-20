define([
    'fastdom',
    'qwery',
    'lib/raven',
    'lib/$',
    'lib/config',
    'lib/detect',
    'lib/user-timing',
    'lib/robust',
    'common/modules/experiments/ab',
    './common',
    './sport',
    'common/modules/analytics/google',
    'lib/geolocation',
    'common/modules/check-dispatcher'
], function (
    fastdom,
    qwery,
    raven,
    $,
    config,
    detect,
    userTiming,
    robust,
    ab,
    common,
    sport,
    ga,
    geolocation,
    checkDispatcher
) {
    return function () {
        var bootstrapContext = function (featureName, bootstrap) {
            raven.context({ tags: { feature: featureName } }, bootstrap, []);
        };


        userTiming.markTime('App Begin');

        robust.catchErrorsWithContext([
            ['ga-user-timing-enhanced-start', function () {
                ga.trackPerformance('Javascript Load', 'enhancedStart', 'Enhanced start parse time');
            }],

            //
            // A/B tests
            //

            ['ab-tests', function () {
                ab.segmentUser();

                robust.catchErrorsWithContext([
                    ['ab-tests-run', ab.run],
                    ['ab-tests-registerImpressionEvents', ab.registerImpressionEvents],
                    ['ab-tests-registerCompleteEvents', ab.registerCompleteEvents],
                ]);

                ab.trackEvent();
            }]
        ]);

        bootstrapContext('common', common.init);

        // geolocation
        robust.catchErrorsWithContext([
            ['geolocation', geolocation.init],
        ]);

        // Front
        if (config.page.isFront) {
            require.ensure([], function (require) {
                bootstrapContext('facia', require('bootstraps/enhanced/facia').init);
            }, 'facia');
        }

        if (config.page.contentType === 'Article' && !config.page.isMinuteArticle) {
            require.ensure([], function (require) {
                bootstrapContext('article', require('bootstraps/enhanced/article').init);
                bootstrapContext('article : image-content', require('bootstraps/enhanced/image-content').init);
            }, 'article');
        }

        if (config.page.contentType === 'Crossword') {
            require.ensure([], function (require) {
                bootstrapContext('crosswords', require('bootstraps/enhanced/crosswords').init);
            }, 'crosswords');
        }

        if (config.page.contentType === 'LiveBlog') {
            require.ensure([], function (require) {
                bootstrapContext('liveBlog', require('bootstraps/enhanced/liveblog').init);
                bootstrapContext('liveBlog : image-content', require('bootstraps/enhanced/image-content').init);
            }, 'live-blog');
        }

        if (config.page.isMinuteArticle) {
            require.ensure([], function (require) {
                bootstrapContext('articleMinute', require('bootstraps/enhanced/article-minute').init);
                bootstrapContext('article : image-content', require('bootstraps/enhanced/image-content').init);
            }, 'article-minute');
        }

        if (config.isMedia || config.page.contentType === 'Interactive') {
            require.ensure([], function (require) {
                bootstrapContext('media : trail', require('bootstraps/enhanced/trail'));
            }, 'trail');
        }

        if ((config.isMedia || qwery('video, audio').length) && !config.page.isHosted) {
            require.ensure([], function (require) {
                bootstrapContext('media', require('bootstraps/enhanced/media/main').init);
            }, 'media');
        }

        if (config.page.contentType === 'Gallery') {
            require.ensure([], function (require) {
                bootstrapContext('gallery', require('bootstraps/enhanced/gallery').init);
                bootstrapContext('gallery : image-content', require('bootstraps/enhanced/image-content').init);
            }, 'gallery');
        }

        if (config.page.contentType === 'ImageContent') {
            require.ensure([], function (require) {
                bootstrapContext('image-content', require('bootstraps/enhanced/image-content').init);
                bootstrapContext('image-content : trail', require('bootstraps/enhanced/trail'));
            }, 'image-content');
        }

        if (config.page.section === 'football') {
            require.ensure([], function (require) {
                bootstrapContext('football', require('bootstraps/enhanced/football').init);
            }, 'football');
        }

        if (config.page.section === 'sport') {
            // Leaving this here for now as it's a tiny bootstrap.
            bootstrapContext('sport', sport.init);
        }

        if (config.page.section === 'identity') {
            require.ensure([], function (require) {
                bootstrapContext('profile', require('bootstraps/enhanced/profile').init);
            }, 'profile');
        }

        if (config.page.isPreferencesPage) {
            require.ensure([], function (require) {
                bootstrapContext('preferences', require('bootstraps/enhanced/preferences').init);
            }, 'preferences');
        }

        if (config.page.section === 'newsletter-signup-page') {
            require.ensure([], function (require) {
                bootstrapContext('newsletters', require('bootstraps/enhanced/newsletters').init);
            }, 'newsletters');
        }

        // use a #force-sw hash fragment to force service worker registration for local dev
        if ((window.location.protocol === 'https:' && config.page.section !== 'identity') || window.location.hash.indexOf('force-sw') > -1) {
            var navigator = window.navigator;
            if (navigator && navigator.serviceWorker) {
                navigator.serviceWorker.register('/service-worker.js');
            }
        }

        if (config.page.pageId === 'help/accessibility-help') {
            require.ensure([], function (require) {
                bootstrapContext('accessibility', require('bootstraps/enhanced/accessibility').init);
            }, 'accessibility');
        }

        if (config.page.showNewRecipeDesign === true) {
            //below is for during testing
            if (config.tests.abNewRecipeDesign) {
                require.ensure([], function (require) {
                    bootstrapContext('recipes', require('bootstraps/enhanced/recipe-article').init);
                }, 'recipes');
            }
        }

        fastdom.read(function() {
            if ( $('.youtube-media-atom').length > 0) {
                require.ensure([], function (require) {
                    bootstrapContext('youtube', require('bootstraps/enhanced/youtube').init);
                }, 'youtube');
            }
        });

        if (window.location.hash.indexOf('devtools') !== -1) {
            require.ensure([], function(require) {
                bootstrapContext('devtools', require('bootstraps/enhanced/devtools').init);
            }, 'devtools');
        }

        // initialise email/outbrain check dispatcher
        bootstrapContext('checkDispatcher', checkDispatcher.init);

        // Mark the end of synchronous execution.
        userTiming.markTime('App End');
        robust.catchErrorsWithContext([
            ['ga-user-timing-enhanced-end', function () {
                ga.trackPerformance('Javascript Load', 'enhancedEnd', 'Enhanced end parse time');
            }],
        ]);
    };
});
