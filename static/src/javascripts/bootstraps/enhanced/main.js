// @flow
import fastdom from 'lib/fastdom-promise';
import qwery from 'qwery';
import raven from 'lib/raven';
import $ from 'lib/$';
import config from 'lib/config';
import { markTime } from 'lib/user-timing';
import { catchErrorsWithContext } from 'lib/robust';
import { runAndTrackAbTests } from 'common/modules/experiments/ab';
import { initSport } from 'bootstraps/enhanced/sport';
import { trackPerformance } from 'common/modules/analytics/google';
import { init as geolocationInit } from 'lib/geolocation';
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
                catchErrorsWithContext([
                    [
                        'ab-tests-run',
                        () => {
                            runAndTrackAbTests();
                        },
                    ],
                ]);
            },
        ],

        ['enrich-acquisition-links', initAcquisitionsLinkEnrichment],
    ]);

    /** common sets up many things that subsequent modules may need.
     * here we make sure it runs first; it's a nice way to avoid
     * race conditions caused by one of the modules below having
     * a transitive dependency on a module that has already been
     * loaded.
     */
    import(/* webpackMode: "eager" */ 'bootstraps/enhanced/common')
        .then(({ init }) => {
            bootstrapContext('common', init);
        })
        .then(() => {
            // geolocation
            catchErrorsWithContext([['geolocation', geolocationInit]]);

            // Front
            if (config.get('page.isFront')) {
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

            if (
                config.get('page.contentType') === 'Article' &&
                !config.get('page.isMinuteArticle')
            ) {
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

            if (config.get('page.contentType') === 'Crossword') {
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

            if (config.get('page.contentType') === 'LiveBlog') {
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

            if (config.get('page.isMinuteArticle')) {
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

            if (
                config.get('page.contentType') === 'Audio' ||
                config.get('page.contentType') === 'Video' ||
                config.get('page.contentType') === 'Interactive'
            ) {
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

            // Old VideoJS player
            fastdom
                .read(() =>
                    qwery(
                        `${
                            config.get('switches.videojs') ? 'video, ' : ''
                        } audio`
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

            // Native video player enhancements
            if (!config.get('switches.videojs')) {
                fastdom
                    .read(() => qwery('video'))
                    .then(els => {
                        if (els.length) {
                            require.ensure(
                                [],
                                require => {
                                    bootstrapContext(
                                        'video-player',
                                        require('bootstraps/enhanced/video-player')
                                            .initVideoPlayer
                                    );
                                },
                                'video-player'
                            );
                        }
                    });
            }

            if (config.get('page.contentType') === 'Gallery') {
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

            if (config.get('page.contentType') === 'ImageContent') {
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

            if (config.get('page.section') === 'football') {
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

            if (config.get('page.section') === 'sport') {
                // Leaving this here for now as it's a tiny bootstrap.
                bootstrapContext('sport', initSport);
            }

            if (config.get('page.section') === 'identity') {
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

            if (config.get('page.isPreferencesPage')) {
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

            if (config.get('page.section') === 'newsletter-signup-page') {
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
                    config.get('page.section') !== 'identity') ||
                window.location.hash.indexOf('force-sw') > -1
            ) {
                const navigator = window.navigator;

                if (navigator && navigator.serviceWorker) {
                    if (config.get('switches.serviceWorkerEnabled')) {
                        navigator.serviceWorker.register('/service-worker.js');
                    } else {
                        navigator.serviceWorker
                            .getRegistrations()
                            .then(registrations => {
                                [...registrations].forEach(registration => {
                                    registration.unregister();
                                });
                            });
                    }
                }
            }

            if (config.get('page.pageId') === 'help/accessibility-help') {
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
                            require('common/modules/experiments')
                                .showExperiments
                        );
                    },
                    'experiments'
                );
            }

            if (config.get('page.contentType') === 'Audio') {
                require.ensure(
                    [],
                    require => {
                        bootstrapContext(
                            'audio',
                            require('common/modules/audio').init
                        );
                    },
                    'audio'
                );
            }

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
        });
};

export { bootEnhanced };
