define([
    'common/utils/fastdom-promise',
    'common/utils/$'
], function (
    fastdomPromise,
    $
) {
    // Polyfill for Object-fit: https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit

    function setBackgroundImage(src) {
        return fastdomPromise.write(function () {
            $('.js-background-image').each(function () {
                var $container = $(this);

                if (src) {
                    $container
                        .css('backgroundImage', 'url(' + src + ')')
                        .addClass('immersive-main-media--fallback');
                }
            });
        });
    }

    function init() {
        return fastdomPromise.read(function () {
            return $('.js-immersive-main-media__img').get(0);
        }).then(function(picture) {
            if (picture) {
                // If CSS.supports isn't supported, or if object fit isn't supported
                if (typeof CSS === 'undefined' || !CSS.supports('object-fit', 'cover')) {
                    var src = picture.currentSrc ? picture.currentSrc : picture.src;
                    setBackgroundImage(src);
                }
            }
        });
    }

    return init;
});
