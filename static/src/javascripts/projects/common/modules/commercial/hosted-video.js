/**
 Hosted video
 */

define([
    'bean',
    'common/utils/$',
    'common/modules/video/tech-order',
    'bootstraps/enhanced/media/video-player'
], function (
    bean,
    $,
    techOrder,
    videojs
) {

    var $videoEl = $('.vjs-hosted__video');

    function init() {
        if (!$videoEl) {
            return;
        }

        videojs($videoEl.get(0), {
            controls: true,
            autoplay: false,
            preload: 'metadata'
        });
    }

    return {
        init: init
    };
});
