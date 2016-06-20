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
        var $captions = $('.hosted-gallery__caption');
        var $progress = $('.hosted-gallery__progress');
        var $border = $('.hosted-gallery__progress--border-2', $progress);
        var $upArrow = $('.inline-arrow-up', $progress);
        var $downArrow = $('.inline-arrow-down', $progress);
        var $counter = $('.hosted-gallery__image-count', $progress);


        bean.on($upArrow[0], 'click', function () {
            var scrollTop = $scrollEl[0].scrollTop;
            var scrollHeight = $scrollEl[0].scrollHeight;
            var progress = $images.length * (scrollTop/scrollHeight);
            fastdom.write(function () {
                $scrollEl.scrollTop(Math.floor(progress - 0.01) * scrollHeight / $images.length);
            });
        });

        bean.on($downArrow[0], 'click', function () {
            var scrollTop = $scrollEl[0].scrollTop;
            var scrollHeight = $scrollEl[0].scrollHeight;
            var progress = $images.length * (scrollTop/scrollHeight);
            fastdom.write(function () {
                $scrollEl.scrollTop(Math.ceil(progress + 0.01) * scrollHeight / $images.length);
            });
        });

        bean.on($scrollEl[0], 'scroll', debounce(function (e) {
            var scrollTop = e.target.scrollTop;
            var scrollHeight = e.target.scrollHeight;
            var progress = Math.round($images.length * (scrollTop/scrollHeight) * 100) / 100;
            var fractionProgress = progress % 1;
            var deg = Math.ceil(fractionProgress * 360);
            fastdom.write(function () {
                $images.each(function (image, index) {
                    var opacity = (progress - index + 1) * 4 / 3;
                    bonzo(image).css('opacity', Math.min(Math.max(opacity, 0), 1));
                });
                $captions.each(function (caption, index) {
                    if(Math.abs(progress - index + 0.125) < 0.225){
                        bonzo(caption).addClass('current-caption');
                    } else {
                        bonzo(caption).removeClass('current-caption');
                    }
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
                bonzo($counter).html(Math.round(progress + 0.75) + '/' + $images.length);
            });
        }, 10));

    }

    return {
        init: init
    };
});
