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
    'common/modules/analytics/beacon',
    'raven',
    'common/modules/ui/message'
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
    beacon,
    Raven,
    Message
) {

    var autoplay = config.isMedia && /desktop|wide/.test(detect.getBreakpoint()),
        QUARTILES = [25, 50, 75],
        // Advert and content events used by analytics. The expected order of bean events is:
        EVENTS = [
            'preroll:ready',
            'preroll:play',
            'preroll:end',
            'content:ready',
            'content:play',
            'content:end'
        ],
        contentType = config.page.contentType.toLowerCase(),
        constructEventName = function(eventName) {
            return contentType + ':' + eventName;
        };


    var modules = {

        ophanRecord: function(id, event) {
            if(id) {
                require('ophan/ng', function (ophan) {
                    var eventObject = {};
                    eventObject[contentType] = {
                        id: id,
                        eventType: event.type
                    };
                    ophan.record(eventObject);
                });
            }
        },

        initOphanTracking: function(player, mediaId) {
            EVENTS.concat(QUARTILES.map(function(q) {
                return 'play:' + q;
            })).forEach(function(event) {
                player.one(constructEventName(event), function(event) {
                    modules.ophanRecord(mediaId, event);
                });
            });
        },

        initOmnitureTracking: function(player) {
            new OmnitureMedia(player).init();
        },

        bindDiagnosticsEvents: function(player) {
            player.on(constructEventName('preroll:play'), function(){
                beacon.fire('/count/vps.gif');
            });
            player.on(constructEventName('preroll:end'), function(){
                beacon.fire('/count/vpe.gif');
            });
            player.on(constructEventName('content:play'), function(){
                beacon.fire('/count/vs.gif');
            });
            player.on(constructEventName('content:end'), function(){
                beacon.fire('/count/ve.gif');
            });

            // count the number of video starts that happen after a preroll
            player.on(constructEventName('preroll:play'), function(){
                player.on(constructEventName('content:play'), function(){
                    beacon.fire('/count/vsap.gif');
                });
            });
        },

        bindPrerollEvents: function(player) {
            var events = {
                end: function() {
                    player.trigger(constructEventName('preroll:end'));
                    modules.bindContentEvents(player, true);
                },
                play: function() {
                    var duration = player.duration();
                    if (duration) {
                        player.trigger(constructEventName('preroll:play'));
                    } else {
                        player.one('durationchange', events.play);
                    }
                },
                ready: function() {
                    player.trigger(constructEventName('preroll:ready'));

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
                    player.trigger(constructEventName('content:end'));
                },
                play: function() {
                    var duration = player.duration();
                    if (duration) {
                        player.trigger(constructEventName('content:play'));
                    } else {
                        player.one('durationchange', events.play);
                    }
                },
                timeupdate: function() {
                    var progress = Math.round(parseInt(player.currentTime()/player.duration()*100, 10));
                    QUARTILES.reverse().some(function(quart) {
                        if (progress >= quart) {
                            player.trigger(constructEventName('play:' + quart));
                            return true;
                        } else {
                            return false;
                        }
                    });
                },
                ready: function() {
                    player.trigger(constructEventName('content:ready'));

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
                        this.one(constructEventName('preroll:end'), events.destroy.bind(player));
                        this.one(constructEventName('content:play'), events.destroy.bind(player));
                        this.one('adtimeout', events.destroy.bind(player));
                    }
                };
            this.one(constructEventName('preroll:play'), events.init.bind(player));
        },

        fullscreener: function() {
            var player = this,
                clickbox = bonzo.create('<div class="vjs-fullscreen-clickbox"></div>')[0],
                events = {
                    click: function(e) {
                        this.paused() ? this.play() : this.pause();
                        e.stop();
                    },
                    dblclick: function(e) {
                        e.stop();
                        this.isFullScreen() ? this.exitFullscreen() : this.requestFullscreen();
                    }
                };

            bonzo(clickbox)
                .appendTo(player.contentEl());

            bean.on(clickbox, 'click', events.click.bind(player));
            bean.on(clickbox, 'dblclick', events.dblclick.bind(player));
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
                videojs.plugin('fullscreener', modules.fullscreener);

                $('.js-gu-media').each(function (el) {
                    var mediaType = el.tagName.toLowerCase();

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

                            modules.initOmnitureTracking(player);
                            modules.initOphanTracking(player, mediaId);

                            // preroll for videos only
                            if (mediaType === 'video') {

                                modules.bindDiagnosticsEvents(player);
                                player.fullscreener();

                                // Init plugins
                                if (config.switches.videoAdverts && !config.page.shouldHideAdverts) {
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

                                if (/desktop|wide/.test(detect.getBreakpoint())) {
                                    modules.initEndSlate(player);
                                }
                            } else {
                                vjs.playlist({
                                    mediaType: 'audio',
                                    continuous: false
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

            player.one(constructEventName('content:play'), function() {
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

            if ('seriesId' in config.page) {
                section.endpoint = '/video/section/' + config.page.section + '/' + config.page.seriesId + '.json?shortUrl=' + config.page.shortUrl;
            } else {
                section.endpoint = '/video/section/' + config.page.section + '.json?shortUrl=' + config.page.shortUrl;
            }
            section.fetch(parentEl).then(function() {
                images.upgrade(parentEl);
            });
        },
        initMostViewedMedia: function() {
            if (config.page.section === 'childrens-books-site' && config.switches.childrensBooksHidePopular) {
                $('.content__secondary-column--media').addClass('u-h');
            } else {
                var mostViewed = new Component();
                mostViewed.endpoint = '/' + config.page.contentType.toLowerCase() + '/most-viewed.json';
                mostViewed.fetch($('.js-video-components-container')[0], 'html');
            }
        },
        displayReleaseMessage: function() {
            var msg = '<p class="site-message__message" id="site-message__message">' +
                    'We\'ve redesigned our video pages to make it easier to find and experience our best video content. We\'d love to hear what you think.' +
                    '</p>' +
                    '<ul class="site-message__actions u-unstyled">' +
                    '<li class="site-message__actions__item">' +
                    '<i class="i i-arrow-white-right"></i>' +
                    '<a href="https://www.surveymonkey.com/s/guardianvideo" target="_blank">Leave feedback</a>' +
                    '</li>' +
                    '<li class="site-message__actions__item">' +
                    '<i class="i i-arrow-white-right"></i>' +
                    '<a href="http://next.theguardian.com/blog/video-redesign/" target="_blank">Find out more</a>' +
                    '</li>' +
                    '</ul>';

            var releaseMessage = new Message('video');

            releaseMessage.show(msg);
        }
    };

    var ready = function () {
        if(config.switches.enhancedMediaPlayer) {
            modules.initPlayer();
        }

        if (config.isMedia) {
            if (config.page.showRelatedContent) {
                modules.initMoreInSection();
            }
            modules.initMostViewedMedia();
        }

        if (config.page.contentType === 'Video' && detect.getBreakpoint() !== 'mobile') {
            modules.displayReleaseMessage();
        }
    };

    return {
        init: ready
    };
});
