/* global videojs */
define([
    'bean',
    'bonzo',
    'raven',
    'common/utils/_',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/defer-to-analytics',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/preferences',
    'common/utils/url',
    'common/modules/commercial/build-page-targeting',
    'common/modules/component',
    'common/modules/onward/history',
    'common/modules/ui/images',
    'common/modules/video/tech-order',
    'common/modules/video/supportedBrowsers',
    'common/modules/video/events',
    'common/modules/analytics/beacon',
    'text!common/views/ui/loading.html'
], function (
    bean,
    bonzo,
    raven,
    _,
    $,
    ajax,
    config,
    deferToAnalytics,
    detect,
    mediator,
    preferences,
    urlUtils,
    buildPageTargeting,
    Component,
    history,
    images,
    techOrder,
    supportedBrowsers,
    events,
    beacon,
    loadingTmpl
) {

    function getVastUrl() {
        var adUnit = config.page.adUnit,
            custParams = urlUtils.constructQuery(buildPageTargeting()),
            encodedCustParams = encodeURIComponent(custParams),
            timestamp = new Date().getTime();
        return 'http://' + config.page.dfpHost + '/gampad/ads?correlator=' + timestamp + '&gdfp_req=1&env=vp&impl=s&output=' +
                'xml_vast2&unviewed_position_start=1&iu=' + adUnit + '&sz=400x300&scp=slot%3Dvideo&cust_params=' + encodedCustParams;
    }

    function fullscreener() {
        var player = this,
            clickbox = bonzo.create('<div class="vjs-fullscreen-clickbox"></div>')[0],
            events = {
                click: function (e) {
                    this.paused() ? this.play() : this.pause();
                    e.stop();
                },
                dblclick: function (e) {
                    e.stop();
                    this.isFullScreen() ? this.exitFullscreen() : this.requestFullscreen();
                }
            };

        bonzo(clickbox)
            .appendTo(player.contentEl());

        bean.on(clickbox, 'click', events.click.bind(player));
        bean.on(clickbox, 'dblclick', events.dblclick.bind(player));
    }

    function initLoadingSpinner(player) {
        player.loadingSpinner.contentEl().innerHTML = loadingTmpl;
    }

    function upgradeVideoPlayerAccessibility(player) {
        // Set the video tech element to aria-hidden, and label the buttons in the videojs control bar.
        // It doesn't matter what kind of tech this is, flash or html5.
        $('.vjs-tech', player.el()).attr('aria-hidden', true);

        // Hide superfluous controls, and label useful buttons.
        $('.vjs-big-play-button', player.el()).attr('aria-hidden', true);
        $('.vjs-current-time', player.el()).attr('aria-hidden', true);
        $('.vjs-time-divider', player.el()).attr('aria-hidden', true);
        $('.vjs-duration', player.el()).attr('aria-hidden', true);
        $('.vjs-embed-button', player.el()).attr('aria-hidden', true);

        $('.vjs-play-control', player.el()).attr('aria-label', 'video play');
        $('.vjs-mute-control', player.el()).attr('aria-label', 'video mute');
        $('.vjs-fullscreen-control', player.el()).attr('aria-label', 'video fullscreen');
    }

    function createVideoPlayer(el, options) {
        var player;

        player = videojs(el, options);

        // we have some special autoplay rules, so do not want to depend on 'default' autoplay
        player.guAutoplay = $(el).attr('data-auto-play') === 'true';

        if (events.handleInitialMediaError(player)) {
            player.dispose();
            options.techOrder = techOrder(el).reverse();
            player = videojs(el, options);
        }

        return player;
    }

    // Apologies for the slightly hacky nature of this.
    // Improvements welcomed...
    function isFlash(event) {
        return event.target.firstChild &&
            event.target.firstChild.id &&
            event.target.firstChild.id.indexOf('flash_api') > 0;
    }

    function initPlayer() {

        // When possible, use our CDN instead of a third party (zencoder).
        if (config.page.videoJsFlashSwf) {
            videojs.options.flash.swf = config.page.videoJsFlashSwf;
        }
        videojs.plugin('adCountdown', events.adCountdown);
        videojs.plugin('adSkipCountdown', events.adSkipCountdown);
        videojs.plugin('fullscreener', fullscreener);

        $('.js-gu-media').each(function (el) {
            var mediaType = el.tagName.toLowerCase(),
                $el = bonzo(el).addClass('vjs vjs-tech-' + videojs.options.techOrder[0]),
                mediaId = $el.attr('data-media-id'),
                blockVideoAds = $el.attr('data-block-video-ads') === 'true',
                showEndSlate = $el.attr('data-show-end-slate') === 'true',
                endSlateUri = $el.attr('data-end-slate'),
                embedPath = $el.attr('data-embed-path'),
                techPriority = techOrder(el),
                player,
                mouseMoveIdle;

            if (config.page.videoJsVpaidSwf && config.switches.vpaidAdverts) {

                // clone the video options and add 'vpaid' to them.
                techPriority = ['vpaid'].concat(techPriority);

                videojs.options.vpaid = {swf: config.page.videoJsVpaidSwf};
            }

            player = createVideoPlayer(el, {
                techOrder: techPriority,
                controls: true,
                autoplay: false,
                preload: 'auto', // preload='none' & autoplay breaks ad loading on chrome35, preload="metadata" breaks older Safari's
                plugins: {
                    embed: {
                        embeddable: !config.page.isFront && config.switches.externalVideoEmbeds && $el.attr('data-embeddable') === 'true',
                        location: config.page.externalEmbedHost + (embedPath ? embedPath : config.page.pageId)
                    }
                }
            });

            // Location of this is important.
            events.bindErrorHandler(player);

            player.guMediaType = mediaType;

            player.ready(function () {
                var vol;

                initLoadingSpinner(player);
                events.bindGlobalEvents(player);
                upgradeVideoPlayerAccessibility(player);
                supportedBrowsers(player);

                player.one('playing', function (e) {
                    if (isFlash(e)) {
                        beacon.counts('video-tech-flash');
                    } else {
                        beacon.counts('video-tech-html5');
                    }
                });

                // unglitching the volume on first load
                vol = player.volume();
                if (vol) {
                    player.volume(0);
                    player.volume(vol);
                }

                player.persistvolume({namespace: 'gu.vjs'});

                deferToAnalytics(function () {

                    events.initOmnitureTracking(player);
                    events.initOphanTracking(player, mediaId);

                    // preroll for videos only
                    if (mediaType === 'video') {

                        player.fullscreener();

                        // Init plugins
                        if (config.switches.videoAdverts && !blockVideoAds && !config.page.isPreview) {
                            events.bindPrerollEvents(player);
                            player.adCountdown();
                            player.adSkipCountdown(15);

                            // Video analytics event.
                            player.trigger(events.constructEventName('preroll:request', player));

                            player.ads({
                                timeout: 3000
                            });
                            player.vast({
                                url: getVastUrl()
                            });
                        } else {
                            events.bindContentEvents(player);
                        }

                        if (showEndSlate && detect.isBreakpoint({ min: 'desktop' })) {
                            initEndSlate(player, endSlateUri);
                        }
                    } else {
                        player.playlist({
                            mediaType: 'audio',
                            continuous: false
                        });

                        events.bindContentEvents(player);
                    }
                });
            });

            mouseMoveIdle = _.debounce(function () { player.removeClass('vjs-mousemoved'); }, 500);

            // built in vjs-user-active is buggy so using custom implementation
            player.on('mousemove', function () {
                player.addClass('vjs-mousemoved');
                mouseMoveIdle();
            });
        });
    }

    function initEndSlate(player, endSlatePath) {
        var endSlate = new Component(),
            endState = 'vjs-has-ended';

        endSlate.endpoint = endSlatePath;
        endSlate.fetch(player.el(), 'html');

        player.one(events.constructEventName('content:play', player), function () {
            player.on('ended', function () {
                bonzo(player.el()).addClass(endState);
            });
        });
        player.on('playing', function () {
            bonzo(player.el()).removeClass(endState);
        });
    }

    function initMoreInSection() {
        if (!config.isMedia || !config.page.showRelatedContent) {
            return;
        }

        var mediaType = config.page.contentType.toLowerCase(),
            section   = new Component(),
            attachTo  = $('.js-onward')[0],
            endpoint  = '/' + mediaType + '/section/' + config.page.section;

        if ('seriesId' in config.page) {
            endpoint += '/' + config.page.seriesId;
        }

        endpoint += '.json?shortUrl=' + config.page.shortUrl;

        // exclude professional network content from video pages
        if (mediaType === 'video') {
            endpoint += '&exclude-tag=guardian-professional/guardian-professional';
        }

        section.endpoint = endpoint;

        section.fetch(attachTo).then(function () {
            images.upgrade(attachTo);
        });
    }

    function initMostViewedMedia() {
        if (!config.isMedia) {
            return;
        }

        var mediaType  = config.page.contentType.toLowerCase(),
            mostViewed = new Component(),
            attachTo   = $(mediaType === 'video' ? '.js-video-components-container' : '.js-media-popular')[0],
            endpoint   = '/' + (config.page.isPodcast ? 'podcast' : mediaType) + '/most-viewed.json';

        mostViewed.manipulationType = mediaType === 'video' ? 'append' : 'html';
        mostViewed.endpoint = endpoint;

        mostViewed.fetch(attachTo, 'html').then(function () {
            images.upgrade(attachTo);
        });
    }

    function ready() {
        if (config.switches.enhancedMediaPlayer) {
            require('bootstraps/video-player', raven.wrap(
                { tags: { feature: 'media' } },
                initPlayer
            ));
        }
        initMoreInSection();
        initMostViewedMedia();

        mediator.emit('page:media:ready');
    }

    return {
        init: ready
    };
});
