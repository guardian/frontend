import fastdom from 'fastdom';
import qwery from 'qwery';
import raven from 'lib/raven';
import $ from 'lib/$';
import config from 'lib/config';
import detect from 'lib/detect';
import userTiming from 'lib/user-timing';
import robust from 'lib/robust';
import ab from 'common/modules/experiments/ab';
import abTests from 'common/modules/experiments/ab-tests';
import abOphan from 'common/modules/experiments/ab-ophan';
import common from './common';
import sport from './sport';
import ga from 'common/modules/analytics/google';
import geolocation from 'lib/geolocation';
import checkDispatcher from 'common/modules/check-dispatcher';
import $__bootstraps_enhanced_facia from 'bootstraps/enhanced/facia';
import $__bootstraps_enhanced_article from 'bootstraps/enhanced/article';
import $__bootstraps_enhanced_image_content from 'bootstraps/enhanced/image-content';
import $__bootstraps_enhanced_crosswords from 'bootstraps/enhanced/crosswords';
import $__bootstraps_enhanced_liveblog from 'bootstraps/enhanced/liveblog';
import $__bootstraps_enhanced_article_minute from 'bootstraps/enhanced/article-minute';
import $__bootstraps_enhanced_trail from 'bootstraps/enhanced/trail';
import $__bootstraps_enhanced_media_main from 'bootstraps/enhanced/media/main';
import $__bootstraps_enhanced_gallery from 'bootstraps/enhanced/gallery';
import $__bootstraps_enhanced_football from 'bootstraps/enhanced/football';
import $__bootstraps_enhanced_profile from 'bootstraps/enhanced/profile';
import $__bootstraps_enhanced_preferences from 'bootstraps/enhanced/preferences';
import $__bootstraps_enhanced_newsletters from 'bootstraps/enhanced/newsletters';
import $__bootstraps_enhanced_accessibility from 'bootstraps/enhanced/accessibility';
import $__bootstraps_enhanced_recipe_article from 'bootstraps/enhanced/recipe-article';
import $__bootstraps_enhanced_youtube from 'bootstraps/enhanced/youtube';
import $__common_modules_devtools from 'common/modules/devtools';
export default function() {
    var bootstrapContext = function(featureName, bootstrap) {
        raven.context({
            tags: {
                feature: featureName
            }
        }, bootstrap, []);
    };


    userTiming.markTime('App Begin');

    robust.catchErrorsWithContext([
        ['ga-user-timing-enhanced-start', function() {
            ga.trackPerformance('Javascript Load', 'enhancedStart', 'Enhanced start parse time');
        }],

        //
        // A/B tests
        //

        ['ab-tests', function() {
            var tests = abTests.getActiveTests();
            ab.segmentUser();

            robust.catchErrorsWithContext([
                ['ab-tests-run', function() {
                    ab.run(tests);
                }],
                ['ab-tests-registerImpressionEvents', function() {
                    abOphan.registerImpressionEvents(tests);
                }],
                ['ab-tests-registerCompleteEvents', function() {
                    abOphan.registerCompleteEvents(tests);
                }],
            ]);

            abOphan.trackABTests();
        }]
    ]);

    bootstrapContext('common', common.init);

    // geolocation
    robust.catchErrorsWithContext([
        ['geolocation', geolocation.init],
    ]);

    // Front
    if (config.page.isFront) {
        require.ensure([], function(require) {
            bootstrapContext('facia', $__bootstraps_enhanced_facia.init);
        }, 'facia');
    }

    if (config.page.contentType === 'Article' && !config.page.isMinuteArticle) {
        require.ensure([], function(require) {
            bootstrapContext('article', $__bootstraps_enhanced_article.init);
            bootstrapContext('article : image-content', $__bootstraps_enhanced_image_content.init);
        }, 'article');
    }

    if (config.page.contentType === 'Crossword') {
        require.ensure([], function(require) {
            bootstrapContext('crosswords', $__bootstraps_enhanced_crosswords.init);
        }, 'crosswords');
    }

    if (config.page.contentType === 'LiveBlog') {
        require.ensure([], function(require) {
            bootstrapContext('liveBlog', $__bootstraps_enhanced_liveblog.init);
            bootstrapContext('liveBlog : image-content', $__bootstraps_enhanced_image_content.init);
        }, 'live-blog');
    }

    if (config.page.isMinuteArticle) {
        require.ensure([], function(require) {
            bootstrapContext('articleMinute', $__bootstraps_enhanced_article_minute.init);
            bootstrapContext('article : image-content', $__bootstraps_enhanced_image_content.init);
        }, 'article-minute');
    }

    if (config.isMedia || config.page.contentType === 'Interactive') {
        require.ensure([], function(require) {
            bootstrapContext('media : trail', $__bootstraps_enhanced_trail);
        }, 'trail');
    }

    if ((config.isMedia || qwery('video, audio').length) && !config.page.isHosted) {
        require.ensure([], function(require) {
            bootstrapContext('media', $__bootstraps_enhanced_media_main.init);
        }, 'media');
    }

    if (config.page.contentType === 'Gallery') {
        require.ensure([], function(require) {
            bootstrapContext('gallery', $__bootstraps_enhanced_gallery.init);
            bootstrapContext('gallery : image-content', $__bootstraps_enhanced_image_content.init);
        }, 'gallery');
    }

    if (config.page.contentType === 'ImageContent') {
        require.ensure([], function(require) {
            bootstrapContext('image-content', $__bootstraps_enhanced_image_content.init);
            bootstrapContext('image-content : trail', $__bootstraps_enhanced_trail);
        }, 'image-content');
    }

    if (config.page.section === 'football') {
        require.ensure([], function(require) {
            bootstrapContext('football', $__bootstraps_enhanced_football.init);
        }, 'football');
    }

    if (config.page.section === 'sport') {
        // Leaving this here for now as it's a tiny bootstrap.
        bootstrapContext('sport', sport.init);
    }

    if (config.page.section === 'identity') {
        require.ensure([], function(require) {
            bootstrapContext('profile', $__bootstraps_enhanced_profile.init);
        }, 'profile');
    }

    if (config.page.isPreferencesPage) {
        require.ensure([], function(require) {
            bootstrapContext('preferences', $__bootstraps_enhanced_preferences.init);
        }, 'preferences');
    }

    if (config.page.section === 'newsletter-signup-page') {
        require.ensure([], function(require) {
            bootstrapContext('newsletters', $__bootstraps_enhanced_newsletters.init);
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
        require.ensure([], function(require) {
            bootstrapContext('accessibility', $__bootstraps_enhanced_accessibility.init);
        }, 'accessibility');
    }

    if (config.page.showNewRecipeDesign === true) {
        //below is for during testing
        if (config.tests.abNewRecipeDesign) {
            require.ensure([], function(require) {
                bootstrapContext('recipes', $__bootstraps_enhanced_recipe_article.init);
            }, 'recipes');
        }
    }

    fastdom.read(function() {
        if ($('.youtube-media-atom').length > 0) {
            require.ensure([], function(require) {
                bootstrapContext('youtube', $__bootstraps_enhanced_youtube.init);
            }, 'youtube');
        }
    });

    if (window.location.hash.indexOf('devtools') !== -1) {
        require.ensure([], function(require) {
            bootstrapContext('devtools', $__common_modules_devtools.showDevTools);
        }, 'devtools');
    }

    // initialise email/outbrain check dispatcher
    bootstrapContext('checkDispatcher', checkDispatcher.init);

    // Mark the end of synchronous execution.
    userTiming.markTime('App End');
    robust.catchErrorsWithContext([
        ['ga-user-timing-enhanced-end', function() {
            ga.trackPerformance('Javascript Load', 'enhancedEnd', 'Enhanced end parse time');
        }],
    ]);
};
