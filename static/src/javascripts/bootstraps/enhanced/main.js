// @flow
import fastdom from 'lib/fastdom-promise';
import qwery from 'qwery';
import raven from 'lib/raven';
import $ from 'lib/$';
import config from 'lib/config';
import { markTime } from 'lib/user-timing';
import { catchErrorsWithContext } from 'lib/robust';
import { segmentUser, run as abRun } from 'common/modules/experiments/ab';
import { getActiveTests } from 'common/modules/experiments/ab-tests';
import {
    registerImpressionEvents,
    registerCompleteEvents,
    trackABTests,
} from 'common/modules/experiments/ab-ophan';
import { init as initCommon } from 'bootstraps/enhanced/common';
import { initSport } from 'bootstraps/enhanced/sport';
import { trackPerformance } from 'common/modules/analytics/google';
import { init as geolocationInit } from 'lib/geolocation';
import { initCheckDispatcher } from 'common/modules/check-dispatcher';
import { init as initAcquisitionsLinkEnrichment } from 'common/modules/commercial/acquisitions-link-enrichment';

const bootEnhanced = (): void => {
    const bootstrapContext = (featureName, bootstrap) => {
        raven.context(
            {
                tags: {
                    feature: featureName,
                },
            },
            bootstrap,
            []
        );
    };

    markTime('App Begin');

    catchErrorsWithContext([
        [
            'ga-user-timing-enhanced-start',
            () => {
                trackPerformance(
                    'Javascript Load',
                    'enhancedStart',
                    'Enhanced start parse time'
                );
            },
        ],

        //
        // A/B tests
        //

        [
            'ab-tests',
            () => {
                const tests = getActiveTests();
                segmentUser();

                catchErrorsWithContext([
                    [
                        'ab-tests-run',
                        () => {
                            abRun(tests);
                        },
                    ],
                    [
                        'ab-tests-registerImpressionEvents',
                        () => {
                            registerImpressionEvents(tests);
                        },
                    ],
                    [
                        'ab-tests-registerCompleteEvents',
                        () => {
                            registerCompleteEvents(tests);
                        },
                    ],
                ]);

                trackABTests();
            },
        ],

        ['enrich-acquisition-links', initAcquisitionsLinkEnrichment],
    ]);

    bootstrapContext('common', initCommon);

    // geolocation
    catchErrorsWithContext([['geolocation', geolocationInit]]);

    // Front
    if (config.page.isFront) {
        require.ensure(
            [],
            require => {
                bootstrapContext(
                    'facia',
                    require('bootstraps/enhanced/facia').init
                );
            },
            'facia'
        );
    }

    if (config.page.contentType === 'Article' && !config.page.isMinuteArticle) {
        require.ensure(
            [],
            require => {
                bootstrapContext(
                    'article',
                    require('bootstraps/enhanced/article').init
                );
                bootstrapContext(
                    'article : lightbox',
                    require('common/modules/gallery/lightbox').init
                );
            },
            'article'
        );
    }

    if (config.page.contentType === 'Crossword') {
        require.ensure(
            [],
            require => {
                bootstrapContext(
                    'crosswords',
                    require('bootstraps/enhanced/crosswords').init
                );
            },
            'crosswords'
        );
    }

    if (config.page.contentType === 'LiveBlog') {
        require.ensure(
            [],
            require => {
                bootstrapContext(
                    'liveBlog',
                    require('bootstraps/enhanced/liveblog').init
                );
                bootstrapContext(
                    'liveBlog : lightbox',
                    require('common/modules/gallery/lightbox').init
                );
            },
            'live-blog'
        );
    }

    if (config.page.isMinuteArticle) {
        require.ensure(
            [],
            require => {
                bootstrapContext(
                    'articleMinute',
                    require('bootstraps/enhanced/article-minute').init
                );
                bootstrapContext(
                    'article : lightbox',
                    require('common/modules/gallery/lightbox').init
                );
            },
            'article-minute'
        );
    }

    if (config.isMedia || config.page.contentType === 'Interactive') {
        require.ensure(
            [],
            require => {
                bootstrapContext(
                    'media : trail',
                    require('bootstraps/enhanced/trail').initTrails
                );
            },
            'trail'
        );
    }

    fastdom
        .read(() =>
            qwery(
                `${config.switches.enhancedVideoPlayer ? 'video, ' : ''} audio`
            )
        )
        .then(els => {
            if (els.length) {
                require.ensure(
                    [],
                    require => {
                        bootstrapContext(
                            'media-player',
                            require('bootstraps/enhanced/media-player')
                                .initMediaPlayer
                        );
                    },
                    'media-player'
                );
            }
        });

    if (config.page.contentType === 'Gallery') {
        require.ensure(
            [],
            require => {
                bootstrapContext(
                    'gallery',
                    require('bootstraps/enhanced/gallery').init
                );
                bootstrapContext(
                    'gallery : lightbox',
                    require('common/modules/gallery/lightbox').init
                );
            },
            'gallery'
        );
    }

    if (config.page.contentType === 'ImageContent') {
        require.ensure(
            [],
            require => {
                bootstrapContext(
                    'image-content : lightbox',
                    require('common/modules/gallery/lightbox').init
                );
                bootstrapContext(
                    'image-content : trail',
                    require('bootstraps/enhanced/trail').initTrails
                );
            },
            'image-content'
        );
    }

    if (config.page.section === 'football') {
        require.ensure(
            [],
            require => {
                bootstrapContext(
                    'football',
                    require('bootstraps/enhanced/football').init
                );
            },
            'football'
        );
    }

    if (config.page.section === 'sport') {
        // Leaving this here for now as it's a tiny bootstrap.
        bootstrapContext('sport', initSport);
    }

    if (config.page.section === 'identity') {
        require.ensure(
            [],
            require => {
                bootstrapContext(
                    'profile',
                    require('bootstraps/enhanced/profile').initProfile
                );
            },
            'profile'
        );
    }

    if (config.page.isPreferencesPage) {
        require.ensure(
            [],
            require => {
                bootstrapContext(
                    'preferences',
                    require('bootstraps/enhanced/preferences').init
                );
            },
            'preferences'
        );
    }

    if (config.page.section === 'newsletter-signup-page') {
        require.ensure(
            [],
            require => {
                bootstrapContext(
                    'newsletters',
                    require('bootstraps/enhanced/newsletters').init
                );
            },
            'newsletters'
        );
    }

    // use a #force-sw hash fragment to force service worker registration for local dev
    if (
        (window.location.protocol === 'https:' &&
            config.page.section !== 'identity') ||
        window.location.hash.indexOf('force-sw') > -1
    ) {
        const navigator = window.navigator;
        if (navigator && navigator.serviceWorker) {
            navigator.serviceWorker.register('/service-worker.js');
        }
    }

    if (config.page.pageId === 'help/accessibility-help') {
        require.ensure(
            [],
            require => {
                bootstrapContext(
                    'accessibility',
                    require('bootstraps/enhanced/accessibility').init
                );
            },
            'accessibility'
        );
    }

    fastdom.read(() => {
        if ($('.youtube-media-atom').length > 0) {
            require.ensure(
                [],
                require => {
                    bootstrapContext(
                        'youtube',
                        require('bootstraps/enhanced/youtube').init
                    );
                },
                'youtube'
            );
        }
    });

    if (window.location.hash.includes('experiments')) {
        require.ensure(
            [],
            require => {
                bootstrapContext(
                    'experiments',
                    require('common/modules/experiments').showExperiments
                );
            },
            'experiments'
        );
    }

    // initialise email/outbrain check dispatcher
    bootstrapContext('checkDispatcher', initCheckDispatcher);

    // Mark the end of synchronous execution.
    markTime('App End');
    catchErrorsWithContext([
        [
            'ga-user-timing-enhanced-end',
            () => {
                trackPerformance(
                    'Javascript Load',
                    'enhancedEnd',
                    'Enhanced end parse time'
                );
            },
        ],
    ]);
};

export { bootEnhanced };
