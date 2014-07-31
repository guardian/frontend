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
    'common/modules/component',
    'common/modules/analytics/beacon'
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
    Component,
    beacon
) {

    var autoplay = config.isMedia && /desktop|wide/.test(detect.getBreakpoint());
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

        ophanRecord: function(id, event) {
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

        initOphanTracking: function(player, mediaId) {
            EVENTS.concat(QUARTILES.map(function(q) {
                return 'video:play:' + q;
            })).forEach(function(event) {
                player.one(event, function(event) {
                    modules.ophanRecord(mediaId, event);
                });
            });
        },

        initOmnitureTracking: function(player) {
            new OmnitureMedia(player).init();
        },

        bindDiagnosticsEvents: function(player) {
            player.on('video:preroll:play', function(){
                beacon.fire('/count/vps.gif');
            });
            player.on('video:preroll:end', function(){
                beacon.fire('/count/vpe.gif');
            });
            player.on('video:content:play', function(){
                beacon.fire('/count/vs.gif');
            });
            player.on('video:content:end', function(){
                beacon.fire('/count/ve.gif');
            });

            // count the number of video starts that happen after a preroll
            player.on('video:preroll:play', function(){
                player.on('video:content:play', function(){
                    beacon.fire('/count/vsap.gif');
                });
            });
        },

        bindPrerollEvents: function(player) {
            var events = {
                end: function() {
                    player.trigger('video:preroll:end');
                    modules.bindContentEvents(player, true);
                },
                play: function() {
                    var duration = player.duration();
                    if (duration) {
                        player.trigger('video:preroll:play');
                    } else {
                        player.one('durationchange', events.play);
                    }
                },
                ready: function() {
                    player.trigger('video:preroll:ready');

                    player.one('adstart', events.play);
                    player.one('adend', events.end);

                    if (autoplay) {
                        player.play();
                    }
                }
            };
            player.one('adsready', events.ready);

            //If no preroll avaliable or preroll fails, still init content tracking
            player.one('adtimeout', function() {
                modules.bindContentEvents(player);
            });
        },

        bindContentEvents: function(player) {
            var events = {
                end: function() {
                    player.trigger('video:content:end');
                },
                play: function() {
                    var duration = player.duration();
                    if (duration) {
                        player.trigger('video:content:play');
                    } else {
                        player.one('durationchange', events.play);
                    }
                },
                timeupdate: function() {
                    var progress = Math.round(parseInt(player.currentTime()/player.duration()*100, 10));
                    QUARTILES.reverse().some(function(quart) {
                        if (progress >= quart) {
                            player.trigger('video:play:' + quart);
                            return true;
                        } else {
                            return false;
                        }
                    });
                },
                ready: function() {
                    player.trigger('video:content:ready');

                    player.one('play', events.play);
                    player.on('timeupdate', _throttle(events.timeupdate, 1000));
                    player.one('ended', events.end);

                    if (autoplay) {
                        player.play();
                    }
                }
            };
            events.ready();
        },

        getVastUrl: function() {
            var adUnit = config.page.adUnit,
                custParams = urlUtils.constructQuery(dfp.buildPageTargeting({ page: config.page })),
                encodedCustParams = encodeURIComponent(custParams),
                timestamp = new Date().getTime();
            return 'http://' + config.page.dfpHost + '/gampad/ads?correlator=' + timestamp + '&gdfp_req=1&env=vp&impl=s&output=' +
                    'xml_vast2&unviewed_position_start=1&iu=' + adUnit + '&sz=400x300&scp=slot%3Dvideo&cust_params=' + encodedCustParams;
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

                $('.js-gu-media').each(function (el) {

                    bonzo(el).addClass('vjs');

                    var mediaId = el.getAttribute('data-media-id'),
                        vjs = videojs(el, {
                            controls: true,
                            autoplay: false,
                            preload: 'metadata' // preload='none' & autoplay breaks ad loading on chrome35
                        });

                    vjs.ready(function () {
                        var player = this;

                        modules.initLoadingSpinner(player);

                        // unglitching the volume on first load
                        var vol = vjs.volume();
                        if (vol) {
                            vjs.volume(0);
                            vjs.volume(vol);
                        }

                        vjs.persistvolume({namespace: 'gu.vjs'});

                        deferToAnalytics(function () {


                            // preroll for videos only
                            if (config.page.contentType === 'Video') {

                                modules.initOmnitureTracking(player);
                                modules.initOphanTracking(player, mediaId);
                                modules.bindDiagnosticsEvents(player);

                                // Init plugins
                                if(config.switches.videoAdverts) {
                                    player.adCountDown();
                                    player.ads({
                                        timeout: 3000
                                    });
                                    player.vast({
                                        url: modules.getVastUrl(),
                                        vidFormats: ['video/mp4', 'video/webm', 'video/ogv', 'video/x-flv']
                                    });
                                    modules.bindPrerollEvents(player);
                                } else {
                                    modules.bindContentEvents(player);
                                }

                                if(/desktop|wide/.test(detect.getBreakpoint())) {
                                    modules.initEndSlate(player);
                                }
                            } else {
                                vjs.playlist({
                                    mediaType: 'audio'
                                });

                                modules.bindContentEvents(player);
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

            player.one('video:content:play', function() {
                player.on('ended', function () {
                    bonzo(player.el()).addClass(endState);
                });
            });
            player.on('playing', function() {
                bonzo(player.el()).removeClass(endState);
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
        initMostViewedMedia: function() {
            var mostViewed = new Component();

            mostViewed.endpoint = '/' + config.page.contentType.toLowerCase() + '/most-viewed.json';
            mostViewed.fetch($('.js-video-components-container')[0], 'html');
        }
    };

    var ready = function () {
        if(config.switches.enhancedMediaPlayer) {
            modules.initPlayer();
        }

        if (config.isMedia) {
            modules.initMoreInSection();
            modules.initMostViewedMedia();
        }
    };

    return {
        init: ready
    };
});
