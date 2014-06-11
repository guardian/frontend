/* global videojs */
define([
    'common/$',
    'common/utils/ajax',
    'common/utils/detect',
    'common/utils/config',
    'common/modules/adverts/query-string',
    'common/modules/adverts/dfp',
    'bean'
], function(
    $,
    ajax,
    detect,
    config,
    queryString,
    dfp,
    bean
) {

    var modules = {

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

        initPlayer: function() {

            require('bootstraps/video-player', function () {
                $('video').each(function (el) {
                    videojs(el, {
                        controls: true,
                        autoplay: false,
                        preload: 'none'
                    }).ready(function () {
                        var player = this;

                        // Bind advert and content events used by analytics. The expected order of bean events is:
                        // video:preroll:ready,
                        // video:preroll:play,
                        // video:preroll:end,
                        // video:content:ready,
                        // video:content:play,
                        // video:content:end
                        modules.bindPrerollEvents(player, el);

                        // Init vast adverts.
                        player.ads({
                            timeout: 3000
                        });
                        player.vast({
                            url: modules.getVastUrl()
                        });
                    });
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
