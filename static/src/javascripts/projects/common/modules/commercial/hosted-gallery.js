define([
    'bean',
    'lodash/functions/debounce',
    'bonzo',
    'fastdom',
    'common/utils/$'
], function (
    bean,
    debounce,
    bonzo,
    fastdom,
    $
) {


    function init() {
        var $scrollEl = $('.hosted-gallery__scroll-container');
        var $images = $('.hosted-gallery__image');
        if (!$scrollEl.length) {
            return;
        }

        bean.on($scrollEl[0], 'scroll', debounce(function (e) {
            var scrollTop = e.target.scrollTop;
            var scrollHeight = e.target.scrollHeight;
            var opacity = $images.length * (scrollTop/scrollHeight) + 1;
            fastdom.write(function () {
                $images.each(function (image, index) {
                    bonzo(image).css('opacity', Math.min(Math.max(opacity - index, 0), 1));
                });
            });
        }, 10));

    }

    return {
        init: init
    };
});
