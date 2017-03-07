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
    'lib/check-dispatcher',
    'lodash/collections/contains'
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
    contains
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

        bootstrapContext('common', common);

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

        // geolocation
        robust.catchErrorsAndLog('geolocation', geolocation.init);

        // Front
        if (config.page.isFront) {
            require(['bootstraps/enhanced/facia'], function (facia) {
                bootstrapContext('facia', facia);
            });
        }

        if (config.page.contentType === 'Article' && !config.page.isMinuteArticle) {
            require(['bootstraps/enhanced/article', 'bootstraps/enhanced/image-content'], function (article, imageContent) {
                bootstrapContext('article', article);
                bootstrapContext('article : image-content', imageContent);
            });
        }

        if (config.page.contentType === 'Crossword') {
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

        if (config.page.isMinuteArticle) {
            require(['bootstraps/enhanced/article-minute', 'bootstraps/enhanced/image-content'], function (articleMinute, imageContent) {
                bootstrapContext('articleMinute', articleMinute);
                bootstrapContext('article : image-content', imageContent);
            });
        }

        if (config.isMedia || config.page.contentType === 'Interactive') {
            require(['bootstraps/enhanced/trail'], function (trail) {
                bootstrapContext('media : trail', {
                    init: trail
                });
            });
        }

        if ((config.isMedia || qwery('video, audio').length) && !config.page.isHosted) {
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

        if (config.page.section === 'newsletter-signup-page') {
            require(['bootstraps/enhanced/newsletters'], function (newsletters) {
                bootstrapContext('newsletters', newsletters);
            });
        }

        // use a #force-sw hash fragment to force service worker registration for local dev
        if ((window.location.protocol === 'https:' && config.page.section !== 'identity') || window.location.hash.indexOf('force-sw') > -1) {
            var navigator = window.navigator;
            if (navigator && navigator.serviceWorker) {
                navigator.serviceWorker.register('/service-worker.js');
            }
        }

        if (config.page.pageId === 'help/accessibility-help') {
            require(['bootstraps/enhanced/accessibility'], function (accessibility) {
                bootstrapContext('accessibility', accessibility);
            });
        }

        if (contains(config.page.nonKeywordTagIds.split(','), 'tone/recipes')) {
            require(['bootstraps/enhanced/recipe-article'], function (recipes) {
                bootstrapContext('recipes', recipes);
            });
        }

        fastdom.read(function() {
            if ( $('.youtube-media-atom').length > 0) {
                require(['bootstraps/enhanced/youtube'], function (youtube) {
                    bootstrapContext('youtube', youtube);
                });
            }
        });

        // initialise email/outbrain check dispatcher
        checkDispatcher.init();

        // Mark the end of synchronous execution.
        userTiming.mark('App End');
        robust.catchErrorsAndLog('ga-user-timing-enhanced-end', function () {
            ga.trackPerformance('Javascript Load', 'enhancedEnd', 'Enhanced end parse time');
        });
    };
});
