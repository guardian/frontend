define([
    'qwery',
    'common/utils/fastdom-promise'
], function (
    qwery,
    fastdom
) {
    function renderAdvertLabel($adSlot) {
        return fastdom.write(function () {
            if (shouldRenderLabel($adSlot)) {
                $adSlot.prepend('<div class="ad-slot__label" data-test-id="ad-slot-label">Advertisement</div>');
            }
        });
    }

    function shouldRenderLabel($adSlot) {
        return !$adSlot.hasClass('ad-slot--frame') &&
            !$adSlot.hasClass('gu-style') &&
            ($adSlot.data('label') !== false && qwery('.ad-slot__label', $adSlot[0]).length === 0);
    }

    return renderAdvertLabel;
});
