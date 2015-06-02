define([
    'fastdom',
    'common/modules/accessibility/main',
    'common/utils/$'
], function (
    fastdom,
    accessibility,
    $
) {
    function shouldHideFlashingElements(callback) {
        if (!accessibility.isOn('flashing-elements')) {
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
        shouldHideFlashingElements: shouldHideFlashingElements
    };
});
