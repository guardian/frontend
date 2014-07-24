/* global videojs */
define([
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/detect',
    'common/utils/config',
    'common/utils/deferToAnalytics',
    'common/utils/url',
    'common/modules/ui/images',
    'common/modules/commercial/dfp',
    'common/modules/analytics/omnitureMedia',
    'lodash/functions/throttle',
    'bean',
    'bonzo',
    'common/modules/component'
], function(
    $,
    ajax,
    detect,
    config,
    deferToAnalytics,
    urlUtils,
    images,
    dfp,
    OmnitureMedia,
    _throttle,
    bean,
    bonzo,
    Component
) {

    var autoplay = config.page.contentType === 'Video' && /desktop|wide/.test(detect.getBreakpoint());
    var QUARTILES = [25, 50, 75];
    // Advert and content events used by analytics. The expected order of bean events is:
    var EVENTS = [
        'video:preroll:ready',
        'video:preroll:play',
        'video:preroll:end',
        'video:content:ready',
        'video:content:play',
        'video:content:end'
    ];

    var modules = {

        ophanRecord: function(playerEl, event) {
            var id = playerEl.getAttribute('data-media-id');
            if(id) {
                require('ophan/ng', function (ophan) {
                    ophan.record({
                        'video': {
                            id: id,
                            eventType: event.type
                        }
                    });
                });
            }
        },

        initOphanTracking: function(playerEl) {
            EVENTS.concat(QUARTILES.map(function(q) {
                return 'video:play:' + q;
            })).forEach(function(event) {
                bean.one(playerEl, event, function(event) {
                    modules.ophanRecord(playerEl, event);
                });
            });
        },

        initOmnitureTracking: function(playerEl) {
            new OmnitureMedia(playerEl).init();
            bonzo(playerEl).addClass('tracking-applied');
        },

        bindPrerollEvents: function(player, videoEl) {
            var playCount = 0;
            var events = {
                end: function() {
                    bean.fire(videoEl, 'video:preroll:end');
                    modules.bindContentEvents(player, videoEl);
                },
                playWithDuration: function() {
                    // Only fire the play event when the duration is known.
                    if (playCount > 0) {
                        bean.fire(videoEl, 'video:preroll:play');
                        playCount = 0;
                    } else {
                        playCount++;
                    }
                },
                ready: function() {
                    bean.fire(videoEl, 'video:preroll:ready');

                    player.one('play', events.playWithDuration);
                    player.one('durationchange', events.playWithDuration);
                    player.one('ended', events.end);

                    if (autoplay) {
                        player.play();
                    }
                }
            };
            player.one('adsready', events.ready);

            //If no preroll avaliable or preroll fails, still init content tracking
            player.one('adtimeout', function() {
                modules.bindContentEvents(player, videoEl, true);
            });
        },

        bindContentEvents: function(player, videoEl, instant) {
            var playCount = 0;
            var events = {
                end: function() {
                    bean.fire(videoEl, 'video:content:end');
                },
                playWithDuration: function() {
                    // Only fire the play event when the duration is known.
                    if (playCount > 0 || player.duration()) {
                        bean.fire(videoEl, 'video:content:play');
                        playCount = 0;
                    } else {
                        playCount++;
                    }
                },
                timeupdate: function() {
                    var progress = Math.round(parseInt(player.currentTime()/player.duration()*100, 10));
                    QUARTILES.reverse().some(function(quart) {
                        if (progress >= quart) {
                            bean.fire(videoEl, 'video:play:' + quart);
                            return true;
                        } else {
                            return false;
                        }
                    });
                },
                ready: function() {
                    bean.fire(videoEl, 'video:content:ready');

                    player.one('play', events.playWithDuration);
                    player.one('durationchange', events.playWithDuration);
                    player.on('timeupdate', _throttle(events.timeupdate, 1000));
                    player.one('ended', events.end);

                    if (autoplay) {
                        player.play();
                    }
                }
            };

            if(instant) {
                events.ready();
            } else {
                player.one('loadstart', events.ready);
            }
        },

        getVastUrl: function() {
            var adUnit = config.page.adUnit,
                custParams = urlUtils.constructQuery(dfp.buildPageTargeting({ page: config.page })),
                encodedCustParams = encodeURIComponent(custParams),
                timestamp = new Date().getTime(),
                url = 'http://' + config.page.dfpHost + '/gampad/ads?correlator=' + timestamp + '&gdfp_req=1&env=vp&impl=s&output=' +
                    'xml_vast2&unviewed_position_start=1&iu=' + adUnit + '&sz=400x300&scp=slot%3Dvideo&cust_params=' + encodedCustParams;

            return url;
        },

        countDown: function() {
            var player = this,
                tmp = '<div class="vjs-ads-overlay js-ads-overlay">Your video will start in <span class="vjs-ads-overlay__remaining js-remaining-time"></span>' +
                      ' seconds <span class="vjs-ads-overlay__label">Advertisement</span></div>',
                events =  {
                    destroy: function() {
                        $('.js-ads-overlay', this.el()).remove();
                        this.off('timeupdate', events.update);
                    },
                    update: function() {
                        $('.js-remaining-time', this.el()).text(parseInt(this.duration() - this.currentTime(), 10).toFixed());
                    },
                    init: function() {
                        $(this.el()).append($.create(tmp));
                        this.on('timeupdate', events.update.bind(this));
                        this.one('video:preroll:end', events.destroy.bind(player));
                        this.one('video:content:play', events.destroy.bind(player));
                        this.one('adtimeout', events.destroy.bind(player));
                    }
                };
            this.one('video:preroll:play', events.init.bind(player));
        },

        initLoadingSpinner: function(player) {
            player.loadingSpinner.contentEl().innerHTML =
                '<div class="pamplemousse">' +
                '<div class="pamplemousse__pip"><i></i></div>' +
                '<div class="pamplemousse__pip"><i></i></div>' +
                '<div class="pamplemousse__pip"><i></i></div>' +
                '</div>';
        },

        initPlayer: function() {

            require('bootstraps/video-player', function () {

                videojs.plugin('adCountDown', modules.countDown);

                $('.gu-video').each(function (el) {
                    var vjs = videojs(el, {
                        controls: true,
                        autoplay: false,
                        preload: 'metadata' // preload='none' & autoplay breaks ad loading on chrome35
                    });

                    vjs.ready(function () {
                        var player = this;

                        modules.initLoadingSpinner(player);

                        deferToAnalytics(function () {

                            modules.initOmnitureTracking(el);
                            modules.initOphanTracking(el);
                            modules.bindPrerollEvents(player, el);

                            // Init plugins
                            player.adCountDown();
                            player.ads({
                                timeout: 3000
                            });
                            player.vast({
                                url: modules.getVastUrl()
                            });
                            if(/desktop|wide/.test(detect.getBreakpoint())) {
                                modules.initEndSlate(player);
                            }
                        });
                    });

                    // built in vjs-user-active is buggy so using custom implementation
                    var timeout;
                    vjs.on('mousemove', function() {
                        if (timeout) {
                            clearTimeout(timeout);
                        } else {
                            vjs.addClass('vjs-mousemoved');
                        }
                        timeout = setTimeout(function() {
                            vjs.removeClass('vjs-mousemoved');
                            timeout = false;
                        }, 500);
                    });

                    // unglitching the volume on first load
                    var vol = vjs.volume();
                    if (vol) {
                        vjs.volume(0);
                        vjs.volume(vol);
                    }

                    vjs.persistvolume({namespace: 'gu.vjs'});
                });
            });
        },
        generateEndSlateUrl: function() {
            var seriesId = config.page.seriesId;
            var sectionId = config.page.section;
            var url = (seriesId)  ? '/video/end-slate/series/' + seriesId : '/video/end-slate/section/' + sectionId;
            return url + '.json?shortUrl=' + config.page.shortUrl;
        },
        initEndSlate: function(player) {
            var endSlate = new Component(),
                endState = 'vjs-has-ended';

            endSlate.endpoint = modules.generateEndSlateUrl();
            endSlate.fetch(player.el(), 'html');

            player.on('ended', function() {
                bonzo(player.el()).addClass(endState);
            });
            player.on('playing', function() {
                bonzo(player.el()).removeClass(endState);
            });
        },
        fetchEndSlateContent: function(callback) {
             ajax({
                url: modules.generateEndSlateUrl(),
                crossOrigin: true,
                type: 'json'
             }).then(function(resp){
                 callback(bonzo.create(resp.html));
             });
        },
        initMoreInSection: function() {
            var section = new Component(),
                parentEl = $('.js-onward')[0];
            section.endpoint = '/video/section/' + config.page.section + '.json?shortUrl=' + config.page.shortUrl;
            section.fetch(parentEl).then(function() {
                images.upgrade(parentEl);
            });
        },
        initMostViewedVideo: function() {
            var mostViewed = new Component();

            mostViewed.endpoint = '/video/most-viewed.json';
            mostViewed.fetch($('.js-video-components-container')[0], 'html');
        }
    };

    var ready = function () {
        modules.initPlayer();

        if(config.page.contentType === 'Video') {
            modules.initMoreInSection();
            modules.initMostViewedVideo();
        }
    };

    return {
        init: ready
    };
});
