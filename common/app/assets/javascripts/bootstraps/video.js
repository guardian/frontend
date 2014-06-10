/* global videojs */
define([
    'common/$',
    'common/utils/ajax',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/config',
    'common/modules/adverts/query-string',
    'common/modules/adverts/dfp'
], function(
    $,
    ajax,
    detect,
    mediator,
    config,
    queryString,
    dfp
) {

    var modules = {

        bindPrerollEvents: function(player) {
            var events ={
                end: function() {
                    mediator.emit('video:preroll:end', player);
                    player.off('play', events.play);
                    player.off('ended', events.end);
                    player.off('adsready', events.ready);
                },
                play: function() {
                    mediator.emit('video:preroll:start', player);
                },
                ready: function() {
                    mediator.emit('video:preroll:request', player);
                    player.one('play', events.play);
                    player.one('ended', events.end);
                }
            };
            player.on('adsready', events.ready);
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

                        //Bind advert events
                        modules.bindPrerollEvents(player);

                        //Init vast adverts
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
