define([
    'bean',
    'fastdom',
    'Promise',
    'common/utils/$'
], function (
    bean,
    fastdom,
    Promise,
    $
) {
    function moveCarousel($carousel, translateWidth) {
        fastdom.write(function () {
            $carousel.css({
                '-webkit-transform': 'translate(' + translateWidth + 'px);',
                'transform': 'translate(' + translateWidth + 'px);'
            });
        });
    }

    function init() {
        return new Promise(function(resolve) {
            var $carousel = $('.js-carousel-wrapper');
            var $carouselItems = $('.hosted__next-video__carousel-item', $carousel);
            var $nextItem = $('.next-oj-item');
            var $prevItem = $('.prev-oj-item');

            if ($carouselItems.length) {
                var translateWidth = 280; //TODO this should be read from styles not hardcoded
                bean.on($nextItem, 'click', function() {
                    moveCarousel($carousel, translateWidth);
                });
                bean.on($prevItem, 'click', function() {
                    moveCarousel($carousel, translateWidth * -1);
                });
            }

            resolve();
        });
    }

    return {
        init: init
    };
});
