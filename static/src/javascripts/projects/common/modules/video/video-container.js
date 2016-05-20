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
        videoWidth = 700,
        translateWidth = 0,
        $videoPlaylist = $('.js-video-playlist'),
        numberOfVideos = $videoPlaylist.attr('data-number-of-videos');

    function init() {
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
        $videoPlaylist.removeClass('video-playlist--end video-playlist--start');
        $('.video-playlist__item--active').removeClass('video-playlist__item--active');

        if (direction === 'next') {
            containerPos++;
        } else {
            containerPos--;
        }

        if (containerPos >= numberOfVideos) {
            containerPos = numberOfVideos;
            $videoPlaylist.addClass('video-playlist--end');
        } else if (containerPos <= 0) {
            containerPos = 0;
            $videoPlaylist.addClass('video-playlist--start');
        }

        resetPlayers();

        translateWidth = 0 - videoWidth * containerPos;

        $('.js-video-playlist-item-' + containerPos).addClass('video-playlist__item--active');

        $('.js-video-playlist-inner').attr('style',
            '-webkit-transform: translate(' + translateWidth + 'px);' +
            'transform: translate(' + translateWidth + 'px);'
        );
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
