/**
    Video Container
 */

define([
    'bean',
    'common/utils/$',
    'bootstraps/enhanced/media/video-player'
], function (
    bean,
    $,
    videojs
) {

    var containerPos = 0,
        numberOfVideos;

    function init() {
        numberOfVideos = $('.js-video-playlist').attr('data-number-of-videos');
        bindEvents();
    }

    function bindEvents() {
        bean.on(document, 'click', $('.js-video-playlist-next'), function () {
            moveCarousel('next');
        }.bind(this));
        bean.on(document, 'click', $('.js-video-playlist-prev'), function () {
            moveCarousel('prev');
        }.bind(this));
    }

    function moveCarousel(direction) {
        $('.js-video-playlist').removeClass('video-playlist--end video-playlist--' + containerPos);

        if (direction === 'next') {
            containerPos++;
        } else {
            containerPos = containerPos - 1;
        }

        if (containerPos >= numberOfVideos) {
            containerPos = numberOfVideos;
            $('.js-video-playlist').addClass('video-playlist--end');
        } else if (containerPos < 0) {
            containerPos = 0;
        }

        resetPlayers();

        $('.js-video-playlist').addClass('video-playlist--' + containerPos);
    }

    function resetPlayers() {
        $('.js-video-playlist .vjs').each(function() {
            videojs($(this)[0]).pause();
        });
    }

    return function () {
        init();
    };
});
