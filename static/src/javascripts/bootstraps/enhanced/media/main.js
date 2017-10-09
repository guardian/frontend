// @flow
import bean from 'bean';
import bonzo from 'bonzo';
import fastdom from 'fastdom';
import raven from 'lib/raven';
import $ from 'lib/$';
import config from 'lib/config';
import deferToAnalytics from 'lib/defer-to-analytics';
import { isBreakpoint } from 'lib/detect';
import mediator from 'lib/mediator';
import { videoAdUrl } from 'common/modules/commercial/video-ad-url';
import { commercialFeatures } from 'commercial/modules/commercial-features';
import { Component } from 'common/modules/component';
import events from 'common/modules/video/events';
import { getVideoInfo, isGeoBlocked } from 'common/modules/video/metadata';
import { fullscreener } from 'common/modules/media/videojs-plugins/fullscreener';
import { skipAd } from 'common/modules/media/videojs-plugins/skip-ad';
import { videoContainerInit } from 'common/modules/video/video-container';
import { onwardVideo } from 'common/modules/video/onward-container';
import { moreInSeriesContainerInit } from 'common/modules/video/more-in-series-container';
import videojsOptions from 'common/modules/video/videojs-options';
import { videojs } from 'bootstraps/enhanced/media/video-player';
import loadingTmpl from 'raw-loader!common/views/ui/loading.html';
import { isAdFreeUser } from 'commercial/modules/user-features';
import { loadScript } from 'lib/load-script';
import { isOn as accessibilityisOn } from 'common/modules/accessibility/main';

const initLoadingSpinner = (player: any): void => {
    player.loadingSpinner.contentEl().innerHTML = loadingTmpl;
};

const upgradeVideoPlayerAccessibility = (player: any): void => {
    // Set the video tech element to aria-hidden, and label the buttons in the videojs control bar.
    $('.vjs-tech', player.el()).attr('aria-hidden', true);

    // Hide superfluous controls, and label useful buttons.
    $('.vjs-big-play-button', player.el()).attr('aria-hidden', true);
    $('.vjs-current-time', player.el()).attr('aria-hidden', true);
    $('.vjs-time-divider', player.el()).attr('aria-hidden', true);
    $('.vjs-duration', player.el()).attr('aria-hidden', true);
    $('.vjs-embed-button', player.el()).attr('aria-hidden', true);

    $('.vjs-play-control', player.el()).attr('aria-label', 'video play');
    $('.vjs-mute-control', player.el()).attr('aria-label', 'video mute');
    $('.vjs-fullscreen-control', player.el()).attr(
        'aria-label',
        'video fullscreen'
    );
};

const createVideoPlayer = (el: HTMLElement, options: Object): any => {
    const player = videojs(el, options);

    const duration = parseInt(el.getAttribute('data-duration'), 10);

    player.ready(() => {
        if (!isNaN(duration)) {
            player.duration(duration);
            player.trigger('timeupdate'); // triggers a refresh of relevant control bar components
        }
        // we have some special autoplay rules, so do not want to depend on 'default' autoplay
        player.guAutoplay = $(el).attr('data-auto-play') === 'true';

        // need to explicitly set the dimensions for the ima plugin.
        player.height(
            bonzo(player.el())
                .parent()
                .dim().height
        );
        player.width(
            bonzo(player.el())
                .parent()
                .dim().width
        );
    });

    return player;
};

const initEndSlate = (player: any, endSlatePath: string): void => {
    const endSlate = new Component();
    const endStateClass = 'vjs-has-ended';

    endSlate.endpoint = endSlatePath;

    player.one(events.constructEventName('content:play', player), () => {
        endSlate.fetch(player.el(), 'html');

        player.on('ended', () => {
            bonzo(player.el()).addClass(endStateClass);
        });
    });

    player.on('playing', () => {
        bonzo(player.el()).removeClass(endStateClass);
    });
};

const initExploreVideo = (): void => {
    const player = $('.vjs-tech');
    const headline = $('.explore-series-headline')[0];
    const controls = $('.vjs-control-bar');

    if (player && headline && controls) {
        bean.on(player[0], 'playing', () => {
            bonzo(headline).addClass('playing');
            bonzo(controls[0]).addClass('playing');
        });
        bean.on(player[0], 'pause', () => {
            bonzo(headline).removeClass('playing');
            bonzo(controls[0]).removeClass('playing');
        });
    }
};

const enhanceVideo = (
    el: HTMLMediaElement,
    autoplay: boolean,
    shouldPreroll: boolean = false
): any => {
    const mediaType = el.tagName.toLowerCase();
    const dataset = el.dataset;
    const { mediaId, endSlate, embedPath } = dataset;

    const // we need to look up the embedPath for main media videos
    canonicalUrl = dataset.canonicalUrl || (embedPath || null);

    const // the fallback to window.location.pathname should only happen for main media on fronts
    gaEventLabel = canonicalUrl || window.location.pathname;

    let mouseMoveIdle;
    let playerSetupComplete;
    let withPreroll;
    let blockVideoAds;

    el.classList.add('vjs');

    // end-slate url follows the patten /video/end-slate/section/<section>.json?shortUrl=
    // only show end-slate if page has a section i.e. not on the `/global` path
    // e.g https://www.theguardian.com/global/video/2016/nov/01/what-happened-at-the-battle-of-orgreave-video-explainer
    const showEndSlate =
        dataset.showEndSlate === 'true' && !!config.get('page.section');

    const player = createVideoPlayer(
        el,
        videojsOptions({
            plugins: {
                embed: {
                    embeddable:
                        !config.page.isFront &&
                        config.switches.externalVideoEmbeds &&
                        (config.page.contentType === 'Video' ||
                            dataset.embeddable === 'true'),
                    location: `${config.page
                        .externalEmbedHost}/embed/video/${embedPath ||
                        config.page.pageId}`,
                },
            },
        })
    );

    events.addContentEvents(player, mediaId, mediaType);
    events.addPrerollEvents(player, mediaId, mediaType);
    events.bindGoogleAnalyticsEvents(player, gaEventLabel);

    getVideoInfo(el).then(videoInfo => {
        if (videoInfo.expired) {
            player.ready(() => {
                player.error({
                    code: 0,
                    type: 'Video Expired',
                    message:
                        'This video has been removed. This could be because it launched early, ' +
                        'our rights have expired, there was a legal issue, or for another reason.',
                });
                player.bigPlayButton.dispose();
                player.errorDisplay.open();
                player.controlBar.dispose();
            });
        } else {
            isGeoBlocked(el).then(isVideoGeoBlocked => {
                if (isVideoGeoBlocked) {
                    player.ready(() => {
                        player.error({
                            code: 0,
                            type: 'Video Unavailable',
                            message:
                                'Sorry, this video is not available in your region due to rights restrictions.',
                        });
                        player.bigPlayButton.dispose();
                        player.errorDisplay.open();
                        player.controlBar.dispose();
                    });
                } else {
                    blockVideoAds =
                        videoInfo.shouldHideAdverts ||
                        (config.switches.adFreeSubscriptionTrial &&
                            isAdFreeUser());

                    withPreroll = shouldPreroll && !blockVideoAds;

                    // Location of this is important.
                    events.bindErrorHandler(player);
                    player.guMediaType = mediaType;

                    playerSetupComplete = new Promise(resolve => {
                        player.ready(() => {
                            deferToAnalytics(() => {
                                events.initOphanTracking(player, mediaId);
                                events.bindGlobalEvents(player);
                                events.bindContentEvents(player);
                                if (withPreroll) {
                                    events.bindPrerollEvents(player);
                                }
                            });

                            initLoadingSpinner(player);
                            upgradeVideoPlayerAccessibility(player);

                            // unglitching the volume on first load
                            const vol = player.volume();

                            if (vol) {
                                player.volume(0);
                                player.volume(vol);
                            }

                            player.persistvolume({
                                namespace: 'gu.vjs',
                            });

                            // preroll for videos only
                            if (mediaType === 'video') {
                                player.fullscreener();

                                if (
                                    showEndSlate &&
                                    isBreakpoint({
                                        min: 'desktop',
                                    })
                                ) {
                                    initEndSlate(player, endSlate);
                                }

                                if (withPreroll) {
                                    raven.wrap(
                                        {
                                            tags: {
                                                feature: 'media',
                                            },
                                        },
                                        () => {
                                            player.ima({
                                                id: mediaId,
                                                adTagUrl: videoAdUrl(),
                                                prerollTimeout: 1000,
                                                // We set this sightly higher so contrib-ads never timeouts before ima.
                                                contribAdsSettings: {
                                                    timeout: 2000,
                                                },
                                            });
                                            player.on('adstart', () => {
                                                player.skipAd(mediaType, 15);
                                            });
                                            player.ima.requestAds();

                                            // Video analytics event.
                                            player.trigger(
                                                events.constructEventName(
                                                    'preroll:request',
                                                    player
                                                )
                                            );
                                            resolve();
                                        }
                                    )();
                                } else {
                                    resolve();
                                }
                            } else {
                                player.playlist({
                                    mediaType: 'audio',
                                    continuous: false,
                                });
                                resolve();
                            }

                            // built in vjs-user-active is buggy so using custom implementation
                            player.on('mousemove', () => {
                                clearTimeout(mouseMoveIdle);
                                fastdom.write(() => {
                                    player.addClass('vjs-mousemoved');
                                });

                                mouseMoveIdle = setTimeout(() => {
                                    fastdom.write(() => {
                                        player.removeClass('vjs-mousemoved');
                                    });
                                }, 500);
                            });
                        });
                    });

                    playerSetupComplete.then(() => {
                        if (
                            autoplay &&
                            accessibilityisOn('flashing-elements')
                        ) {
                            player.play();
                        }
                    });
                }
            });
        }
    });
    if ($('.explore--video').length > 0) {
        initExploreVideo();
    }
    return player;
};

const initPlayButtons = (root: ?HTMLElement): void => {
    fastdom.read(() => {
        $('.js-video-play-button', root).each(el => {
            const $el = bonzo(el);
            bean.on(el, 'click', () => {
                const container = bonzo(el)
                    .parent()
                    .parent();
                const placeholder = $('.js-video-placeholder', container);
                const player = $('.js-video-player', container);

                fastdom.write(() => {
                    placeholder
                        .removeClass('media__placeholder--active')
                        .addClass('media__placeholder--hidden');
                    player
                        .removeClass('media__container--hidden')
                        .addClass('media__container--active');
                    $el
                        .removeClass('media__placeholder--active')
                        .addClass('media__placeholder--hidden');
                    enhanceVideo($('video', player).get(0), true);
                });
            });
            fastdom.write(() => {
                $el
                    .removeClass('media__placeholder--hidden')
                    .addClass('media__placeholder--active');
            });
        });
    });
};

const initPlayer = (withPreroll: boolean): void => {
    videojs.plugin('skipAd', skipAd);
    videojs.plugin('fullscreener', fullscreener);

    fastdom.read(() => {
        $('.js-gu-media--enhance').each(el => {
            enhanceVideo(el, false, withPreroll);
        });
    });
};

const getMediaType = (): string => config.page.contentType.toLowerCase();

const initMoreInSection = (): void => {
    if (
        !config.isMedia ||
        !config.page.showRelatedContent ||
        config.page.isPaidContent ||
        !config.page.section
    ) {
        return;
    }

    const el = $('.js-more-in-section')[0];
    moreInSeriesContainerInit(
        el,
        getMediaType(),
        config.page.section,
        config.page.shortUrl,
        config.page.seriesId
    );
};

const initOnwardContainer = (): void => {
    if (!config.isMedia) {
        return;
    }

    const mediaType = getMediaType();
    const els = $(
        mediaType === 'video'
            ? '.js-video-components-container'
            : '.js-media-popular'
    );

    els.each(el => {
        onwardVideo(el, mediaType);
    });
};

const initWithRaven = (withPreroll: boolean = false): void => {
    raven.wrap(
        {
            tags: {
                feature: 'media',
            },
        },
        () => {
            initPlayer(withPreroll);
        }
    )();
};

const initFacia = (): void => {
    if (config.page.isFront) {
        $('.js-video-playlist').each(el => {
            videoContainerInit(el);
        });
    }
};

export const init = (): void => {
    // The `hasMultipleVideosInPage` flag is temporary until the # will be fixed
    const shouldPreroll =
        commercialFeatures.videoPreRolls &&
        !config.page.hasMultipleVideosInPage &&
        !config.page.hasYouTubeAtom &&
        !config.page.isFront &&
        !config.page.isPaidContent &&
        !config.page.sponsorshipType;

    if (config.switches.enhancedMediaPlayer) {
        if (shouldPreroll) {
            loadScript('//imasdk.googleapis.com/js/sdkloader/ima3.js')
                .then(() => {
                    initWithRaven(true);
                })
                .catch(e => {
                    raven.captureException(e, {
                        tags: {
                            feature: 'media',
                            action: 'ads',
                            ignored: true,
                        },
                    });
                    initWithRaven();
                });
        } else {
            initWithRaven();
        }
    }

    // Setup play buttons
    initPlayButtons(document.body);
    mediator.on('modules:related:loaded', initPlayButtons);
    mediator.on('page:media:moreinloaded', initPlayButtons);

    initFacia();

    initMoreInSection();

    initOnwardContainer();
};
