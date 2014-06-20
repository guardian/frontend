/* global videojs */
define([
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/detect',
    'common/utils/config',
    'common/modules/adverts/query-string',
    'common/modules/adverts/dfp',
    'bean',
    'bonzo'
], function(
    $,
    ajax,
    detect,
    config,
    queryString,
    dfp,
    bean,
    bonzo
) {

    var autoplay = config.page.contentType === 'Video' && /desktop|wide/.test(detect.getBreakpoint());

    var secsToNiceString = function(val) {
        var secs = val % 60;
        var mins = Math.floor(val / 60);
        var hours = Math.floor(mins / 60);

        return (hours ? hours+'h ' : '') +
               (mins ? mins+'m ' : '') +
               (secs ? secs+'s ' : '');
    };

    var modules = {

        bindPrerollEvents: function(player, videoEl) {

            // Bind advert and content events used by analytics. The expected order of bean events is:
            // video:preroll:ready,
            // video:preroll:play,
            // video:preroll:end,
            // video:content:ready,
            // video:content:play,
            // video:content:end

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
        },

        bindContentEvents: function(player, videoEl) {
            var playCount = 0;
            var events = {
                end: function() {
                    bean.fire(videoEl, 'video:content:end');
                },
                playWithDuration: function() {
                    // Only fire the play event when the duration is known.
                    if (playCount > 0) {
                        bean.fire(videoEl, 'video:content:play');
                        playCount = 0;
                    } else {
                        playCount++;
                    }
                },
                ready: function() {
                    bean.fire(videoEl, 'video:content:ready');

                    player.one('play', events.playWithDuration);
                    player.one('durationchange', events.playWithDuration);
                    player.one('ended', events.end);

                    if (autoplay) {
                        player.play();
                    }
                }
            };
            player.one('loadstart', events.ready);
        },

        getVastUrl: function() {
            var adUnit = dfp.buildAdUnit({ page: config.page }),
                custParams = queryString.generateQueryString(dfp.buildPageTargeting({ page: config.page })),
                encodedCustParams = encodeURIComponent(custParams),
                timestamp = new Date().getTime(),
                url = 'http://' + config.page.dfpHost + '/gampad/ads?correlator=' + timestamp + '&gdfp_req=1&env=vp&impl=s&output=' +
                    'xml_vast2&unviewed_position_start=1&iu=' + adUnit + '&sz=400x300&scp=slot%3Dvideo&cust_params=' + encodedCustParams;

            return url;
        },

        countDown: function() {
            var tmp = '<div class="vjs-ads-overlay js-ads-overlay">Your video will start in <span class="vjs-ads-overlay__remaining js-remaining-time"></span>' +
                      ' seconds <span class="vjs-ads-overlay__label">Advertisement</span></div>',
                events =  {
                    destroy: function() {
                        $('.js-ads-overlay', this.el()).remove();
                        this.off('timeupdate', events.update);
                        this.off('ended', events.destroy);
                    },
                    update: function() {
                        $('.js-remaining-time', this.el()).text(parseInt(this.duration() - this.currentTime(), 10).toFixed());
                    },
                    init: function() {
                        this.on('timeupdate', events.update.bind(this));
                        this.one('ended', events.destroy.bind(this));
                        $(this.el()).append($.create(tmp));
                    }
                };

            this.one('firstplay', events.init.bind(this));
        },

        initOverlays: function(el) {
            var title = el.getAttribute('data-title');
            if (title) {
                var vjs = videojs(el),
                    vjsContainer = vjs.el(),
                    duration = el.getAttribute('data-duration'),
                    durationHTML = duration ? '<div class="vjs-overlay__duration">' + secsToNiceString(duration) + '</div>' : '',
                    bigTitleHTML = '<div class="vjs-overlay__title">' + title + '</div>',
                    bigTitleEl = bonzo(document.createElement('div'))
                        .appendTo(vjsContainer)
                        .addClass('vjs-overlay')
                        .addClass('vjs-overlay--big-title')
                        .html(bigTitleHTML + durationHTML),
                    smallTitleEl = bonzo(document.createElement('div'))
                        .addClass('vjs-overlay')
                        .addClass('vjs-overlay--small-title')
                        .html(title);

                vjs.one('play', function() {
                    bigTitleEl.remove();
                    bigTitleEl = undefined;
                    smallTitleEl.appendTo(vjsContainer);
                });
            }
        },

        initPlayer: function() {

            require('bootstraps/video-player', function () {

                videojs.plugin('adCountDown', modules.countDown);

                $('video').each(function (el) {
                    var vjs = videojs(el, {
                        controls: true,
                        autoplay: false,
                        preload: 'metadata' // preload='none' & autoplay breaks ad loading on chrome35
                    });

                    vjs.ready(function () {
                        var player = this;

                        modules.bindPrerollEvents(player, el);

                        player.adCountDown();

                        // Init vast adverts.
                        player.ads({
                            timeout: 3000
                        });
                        player.vast({
                            url: modules.getVastUrl()
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
        }
    };

    var ready = function () {
        modules.initPlayer();
    };

    return {
        init: ready
    };
});
