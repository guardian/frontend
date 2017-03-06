define([
    'fastdom',
    'common/modules/accessibility/main',
    'lib/$'
], function (
    fastdom,
    accessibility,
    $
) {
    function shouldHideFlashingElements(callback) {
        if (!accessibility.isOn('flashing-elements')) {
            fastdom.write(function () {
                $('body').addClass('disable-flashing-elements');
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
