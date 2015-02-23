define([
    'bonzo',
    'fastdom',
    'qwery',
    'common/utils/_',
    'common/utils/detect',
    'common/utils/mediator'
], function (
    bonzo,
    fastdom,
    qwery,
    _,
    detect,
    mediator
) {
    function reveal($image) {
        fastdom.write(function () {
            $image.attr('srcset', $image.attr('data-srcset'));
            $image.attr('sizes', $image.attr('data-sizes'));
            $image.removeAttr('src');

            fastdom.defer(function () {
                mediator.emit('ui:images:lazyLoaded', $image[0]);
            });
        });
    }

    return function (images, distanceBeforeLoad) {
        var $images = _.map(images, bonzo),
            lazyLoad;

        distanceBeforeLoad = distanceBeforeLoad || detect.getViewport().height;

        lazyLoad = _.throttle(function () {
            fastdom.read(function () {
                var scrollTop,
                    scrollBottom,
                    threshold,
                    $nextImages = [];

                if ($images.length === 0) {
                    mediator.off('window:scroll', lazyLoad);
                } else {
                    scrollTop = bonzo(document.body).scrollTop();
                    scrollBottom = scrollTop + bonzo.viewport().height;
                    threshold = scrollBottom + distanceBeforeLoad;
                    _.forEach($images, function ($image) {
                        // offsetParent is fast to check, but it won't work for fixed elements.
                        // see http://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
                        if ($image.offset().top < threshold && $image[0].offsetParent !== null) {
                            reveal($image);
                        } else {
                            $nextImages.push($image);
                        }
                    });
                    $images = $nextImages;
                }
            });
        }, 100);

        mediator.on('window:scroll', lazyLoad);
        lazyLoad();
    };
});
