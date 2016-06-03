define([
    'common/utils/fastdom-promise',
    'common/utils/$'
], function (
    fastdomPromise,
    $
) {
    // Polyfill for Object-fit: https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit

    function getStyle (el) {
        var style = getComputedStyle(el);
        return style['object-fit'];
    }

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
            return document.getElementsByClassName('js-immersive-main-media__img')[0];
        }).then(function(picture) {
            var style = getStyle(picture);
            // if image doesn't use object-fit or has the default behavior (fill)
            if (!style || style === 'fill') {
                setBackgroundImage(picture.src);
            }
        });
    }

    return init;
});
