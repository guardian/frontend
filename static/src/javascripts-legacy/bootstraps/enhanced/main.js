define([
    'fastdom',
    'bean',
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
    'common/modules/check-dispatcher',
    'lodash/collections/contains',
    'common/modules/tailor/tailor-survey-overlay'
], function (
    fastdom,
    bean,
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
    checkDispatcher,
    contains,
    tailorSurveyOverlay
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
        robust.catchErrorsAndLog('ga-user-timing-enhanced-start', function () {
            ga.trackPerformance('Javascript Load', 'enhancedStart', 'Enhanced start parse time');
        });

        //
        // A/B tests
        //

        robust.catchErrorsAndLog('ab-tests', function () {
            ab.segmentUser();

            robust.catchErrorsAndLog('ab-tests-run', ab.run);
            robust.catchErrorsAndLog('ab-tests-registerImpressionEvents', ab.registerImpressionEvents);
            robust.catchErrorsAndLog('ab-tests-registerCompleteEvents', ab.registerCompleteEvents);

            ab.trackEvent();
        });

        bootstrapContext('common', common);

        // geolocation
        robust.catchErrorsAndLog('geolocation', geolocation.init);

        // Front
        if (config.page.isFront) {
            require.ensure([], function (require) {
                bootstrapContext('facia', require('bootstraps/enhanced/facia'));
            }, 'facia');
        }

        if (config.page.contentType === 'Article' && !config.page.isMinuteArticle) {
            require.ensure([], function (require) {
                bootstrapContext('article', require('bootstraps/enhanced/article'));
                bootstrapContext('article : image-content', require('bootstraps/enhanced/image-content'));
            }, 'article');
        }

        if (config.page.contentType === 'Crossword') {
            require.ensure([], function (require) {
                bootstrapContext('crosswords', require('bootstraps/enhanced/crosswords'));
            }, 'crosswords');
        }

        if (config.page.contentType === 'LiveBlog') {
            require.ensure([], function (require) {
                bootstrapContext('liveBlog', require('bootstraps/enhanced/liveblog'));
                bootstrapContext('liveBlog : image-content', require('bootstraps/enhanced/image-content'));
            }, 'live-blog');
        }

        if (config.page.isMinuteArticle) {
            require.ensure([], function (require) {
                bootstrapContext('articleMinute', require('bootstraps/enhanced/article-minute'));
                bootstrapContext('article : image-content', require('bootstraps/enhanced/image-content'));
            }, 'article-minute');
        }

        if (config.isMedia || config.page.contentType === 'Interactive') {
            require.ensure([], function (require) {
                bootstrapContext('media : trail', {
                    init: require('bootstraps/enhanced/trail')
                });
            }, 'trail');
        }

        if ((config.isMedia || qwery('video, audio').length) && !config.page.isHosted) {
            require.ensure([], function (require) {
                bootstrapContext('media', require('bootstraps/enhanced/media/main'));
            }, 'media');
        }

        if (config.page.contentType === 'Gallery') {
            require.ensure([], function (require) {
                bootstrapContext('gallery', require('bootstraps/enhanced/gallery'));
                bootstrapContext('gallery : image-content', require('bootstraps/enhanced/image-content'));
            }, 'gallery');
        }

        if (config.page.contentType === 'ImageContent') {
            require.ensure([], function (require) {
                bootstrapContext('image-content', require('bootstraps/enhanced/image-content'));
                bootstrapContext('image-content : trail', {
                    init: require('bootstraps/enhanced/trail')
                });
            }, 'image-content');
        }

        if (config.page.section === 'football') {
            require.ensure([], function (require) {
                bootstrapContext('football', require('bootstraps/enhanced/football'));
            }, 'football');
        }

        if (config.page.section === 'sport') {
            // Leaving this here for now as it's a tiny bootstrap.
            bootstrapContext('sport', sport);
        }

        if (config.page.section === 'identity') {
            require.ensure([], function (require) {
                bootstrapContext('profile', require('bootstraps/enhanced/profile'));
            }, 'profile');
        }

        if (config.page.isPreferencesPage) {
            require.ensure([], function (require) {
                bootstrapContext('preferences', require('bootstraps/enhanced/preferences'));
            }, 'preferences');
        }

        if (config.page.section === 'newsletter-signup-page') {
            require.ensure([], function (require) {
                bootstrapContext('newsletters', require('bootstraps/enhanced/newsletters'));
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
                bootstrapContext('accessibility', require('bootstraps/enhanced/accessibility'));
            }, 'accessibility');
        }

        if (config.page.showNewRecipeDesign === true) {
            //below is for during testing
            if (config.tests.abNewRecipeDesign) {
                require(['bootstraps/enhanced/recipe-article'], function (recipes) {
                    bootstrapContext('recipes', recipes);
                });
            }
        }

        fastdom.read(function() {
            if ( $('.youtube-media-atom').length > 0) {
                require.ensure([], function (require) {
                    bootstrapContext('youtube', require('bootstraps/enhanced/youtube'));
                }, 'youtube');
            }
        });

        // initialise email/outbrain check dispatcher
        bootstrapContext('checkDispatcher', checkDispatcher);

        // initialise tailor overlay survey
        if (config.switches.tailorSurveyOverlay) {
            bootstrapContext('tailorSurveyOverlay', tailorSurveyOverlay);
        }

        // Mark the end of synchronous execution.
        userTiming.mark('App End');
        robust.catchErrorsAndLog('ga-user-timing-enhanced-end', function () {
            ga.trackPerformance('Javascript Load', 'enhancedEnd', 'Enhanced end parse time');
        });
    };
});
