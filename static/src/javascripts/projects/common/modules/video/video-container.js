/**
    Video Container
 */

define([
    'bean',
    'fastdom',
    'common/utils/$',
    'common/utils/element-inview',
    'bootstraps/enhanced/media/video-player'
], function (
    bean,
    fastdom,
    $,
    ElementInview,
    videojs
) {

    var containerPos = 0,
        videoWidth = 700,
        translateWidth = 0,
        $videoPlaylist = $('.js-video-playlist'),
        numberOfVideos = $videoPlaylist.attr('data-number-of-videos'),
        preloadImageCount = 2;

    function init() {
        bindEvents();
        initLazyLoadImages();
    }

    function initLazyLoadImages() {
        $('.js-video-playlist-image').each(function(el) {
            // We wrap this in a read as ElementInview reads the DOM.
            fastdom.read(function() {
                var elementInview = ElementInview(el , $('.js-video-playlist-inner').get(0), {
                    // This loads 1 image in the future
                    left: 410
                });

                elementInview.on('firstview', function(el) {
                    fastdom.write(function() {
                        var dataSrc = el.getAttribute('data-src');
                        var src = el.getAttribute('src');

                        if (dataSrc && !src) {
                            fastdom.write(function() {
                                el.setAttribute('src', dataSrc);
                            });
                        }
                    });
                });
            });
        });
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
            fetchImage(containerPos + preloadImageCount);
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

    function fetchImage(i) {


        // $('.js-video-playlist-image--' + i).map(function(el) {
        //     fastdom.read(function () {
        //         var dataSrc = el.getAttribute('data-src');
        //         var src = el.getAttribute('src');
        //         if (dataSrc && !src) {
        //             fastdom.write(function() {
        //                 el.setAttribute('src', dataSrc);
        //             });
        //         }
        //     });
        // });
    }

    return function () {
        init();
    };
});
