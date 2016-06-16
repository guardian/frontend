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
        var $progress = $('.hosted-gallery__progress');
        var $border = $('.hosted-gallery__progress--border-2');
        if (!$scrollEl.length) {
            return;
        }

        bean.on($scrollEl[0], 'scroll', debounce(function (e) {
            var scrollTop = e.target.scrollTop;
            var scrollHeight = e.target.scrollHeight;
            var progress = $images.length * (scrollTop/scrollHeight) + 1;
            var fractionProgress = progress % 1;
            var deg = Math.ceil(fractionProgress * 360);
            fastdom.write(function () {
                $images.each(function (image, index) {
                    var opacity = Math.min(Math.max((progress - index) * 4 / 3, 0), 1);
                    bonzo(image).css('opacity', opacity);
                });
                bonzo($border).css('transform', 'rotate('+deg+'deg)');
                bonzo($border).css('-webkit-transform', 'rotate('+deg+'deg)');
                ['quarter-2', 'quarter-3', 'quarter-4'].forEach(function (cssClass, index) {
                    if(4 * fractionProgress > index + 1){
                        bonzo($progress).addClass(cssClass);
                    } else {
                        bonzo($progress).removeClass(cssClass);
                    }
                });
            });
        }, 10));

    }

    return {
        init: init
    };
});
