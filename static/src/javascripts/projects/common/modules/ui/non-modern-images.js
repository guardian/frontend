define([
    'bonzo',
    'common/utils/$'
], function (
    bonzo,
    $
) {
    $('.js-lazy-loaded-image').each(function (image) {
        var $image = bonzo(image),
            fallback = $image.attr('data-fallback-src');
        if (fallback) {
            $image.attr('src', fallback);
            $image.removeAttr('data-fallback-src');
        }
    });
});
