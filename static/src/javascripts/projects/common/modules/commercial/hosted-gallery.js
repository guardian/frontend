define([
    'bean',
    'bonzo',
    'fastdom',
    'common/utils/$'
], function (
    bean,
    bonzo,
    fastdom,
    $
) {


    function init() {
        var $scrollEl = $('.hosted-gallery__scroll-container');
        var $images = $('.hosted-gallery__image');
        var noImages = $images.length;
        if (!$scrollEl.length) {
            return;
        }

        bean.on($scrollEl[0], 'scroll', function (e) {
            var scrollTop = e.target.scrollTop;
            var scrollHeight = e.target.scrollHeight;
            var opacity = noImages * (scrollTop/scrollHeight) + 1;
            fastdom.write(function () {
                $images.each(function (im, index) {
                    bonzo(im).css('opacity', opacity - index);
                });
            });
        });

    }

    return {
        init: init
    };
});
