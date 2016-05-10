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

    var $videoEl = $('.vjs-hosted__video'),
        player;

    function init() {
        console.log('before');
        if (!$videoEl) {
            return;
        }
        console.log('after');

        player = videojs($videoEl.get(0), {
            controls: true,
            autoplay: false,
            preload: 'metadata'
        });
    }

    return {
        init: init
    };
});
