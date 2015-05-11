define([
    'fastdom',
    'common/modules/accessibility/main',
    'common/utils/$'
], function (
    fastdom,
    accessibility,
    $
) {
    function hideFlashingImages(callback) {
        if (!accessibility.isOn('flashing-images')) {
            fastdom.write(function () {
                $('.js-flashing-image').remove();
                if (callback) {
                    callback();
                }
            });
        } else if (callback) {
            callback();
        }
    }

    return {
        hideFlashingImages: hideFlashingImages
    };
});
