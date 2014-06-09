/* global videojs */
define([
    'common/$',
    'common/utils/ajax',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/config',
    'common/modules/adverts/video',
    'common/modules/adverts/query-string',
    'common/modules/adverts/dfp'
], function(
    $,
    ajax,
    detect,
    mediator,
    config,
    VideoAdvert,
    queryString,
    dfp
) {

    var modules = {

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
