define([
    'Promise',
    'common/utils/fastdom-promise'
], function (
    Promise,
    fastdom
) {
    function renderAdvertLabel(adSlotNode) {
        if (shouldRenderLabel(adSlotNode)) {
            return fastdom.write(function () {
                adSlotNode.insertAdjacentHTML('afterbegin', '<div class="ad-slot__label" data-test-id="ad-slot-label">Advertisement</div>');
            });
        } else {
            return Promise.resolve(null);
        }
    }

    function shouldRenderLabel(adSlotNode) {
        return !(
            adSlotNode.classList.contains('ad-slot--frame') ||
            adSlotNode.classList.contains('gu-style') ||
            adSlotNode.classList.contains('ad-slot--facebook') ||
            adSlotNode.getAttribute('data-label') === 'false' ||
            adSlotNode.getElementsByClassName('ad-slot__label').length
        );
    }

    return renderAdvertLabel;
});
