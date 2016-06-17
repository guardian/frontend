define([
    'qwery',
    'Promise',
    'common/utils/fastdom-promise'
], function (
    qwery,
    Promise,
    fastdom
) {
    function renderAdvertLabel($adSlot) {
        if (shouldRenderLabel($adSlot)) {
            return fastdom.write(function () {
                $adSlot.prepend('<div class="ad-slot__label" data-test-id="ad-slot-label">Advertisement</div>');
            });
        } else {
            return Promise.resolve(null);
        }
    }

    function shouldRenderLabel($adSlot) {
        return !$adSlot.hasClass('ad-slot--frame') &&
            !$adSlot.hasClass('gu-style') &&
            ($adSlot.data('label') !== false && qwery('.ad-slot__label', $adSlot[0]).length === 0);
    }

    return renderAdvertLabel;
});
