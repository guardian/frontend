/**
    Video Container
 */

define([
    'bean',
    'common/utils/$'
], function (
    bean,
    $
) {

    var containerPos = 0;

    function bindEvents() {
        bean.on(document, 'click', $('.js-video-playlist-next'), function () {
            moveCarousel('next');
        }.bind(this));
        bean.on(document, 'click', $('.js-video-playlist-prev'), function () {
            moveCarousel('prev');
        }.bind(this));
    }

    function moveCarousel(direction) {
        $('.js-video-playlist').removeClass('video-playlist--' + containerPos);

        if (direction === 'next') {
            containerPos++;
        } else {
            containerPos = containerPos - 1;
        }

        $('.js-video-playlist').addClass('video-playlist--' + containerPos);
    }

    return function () {
        bindEvents();
    };
});
