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
        bean.on(document, 'click', $('.js-video-playlist-next'), function (e) {
            moveCarousel("next");
        }.bind(this));
        bean.on(document, 'click', $('.js-video-playlist-prev'), function (e) {
            moveCarousel("prev");
        }.bind(this));
    };

    function moveCarousel(direction) {
        if (direction === "next") {
            $(".js-video-playlist").removeClass("video-playlist--" + containerPos);
            containerPos++;
            $(".js-video-playlist").addClass("video-playlist--" + containerPos);
        } else {
            $(".js-video-playlist").removeClass("video-playlist--" + containerPos);
            containerPos = containerPos - 1;
            $(".js-video-playlist").addClass("video-playlist--" + containerPos);
        }
    };

    return function () {
        console.log("video");
        bindEvents();
    };
});
