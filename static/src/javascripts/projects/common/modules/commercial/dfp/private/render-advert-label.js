define([
    'Promise',
    'common/utils/fastdom-promise',
    'common/utils/config',
    'common/utils/cookies'
], function (
    Promise,
    fastdom,
    config,
    cookies
) {
    function renderAdvertLabel(adSlotNode) {
        if (shouldRenderLabel(adSlotNode)) {
            return fastdom.write(function () {
                if (config.switches.abAdFeedback && cookies.get('gu_ad_feedback') === 'ad-feedback-variant') {
                    adSlotNode.insertAdjacentHTML('afterbegin', '<div class="ad-slot__label" data-test-id="ad-slot-label">Advertisement<div class="ad-slot__feedback">Feedback UI goes here</div></div>');
                } else {
                    adSlotNode.insertAdjacentHTML('afterbegin', '<div class="ad-slot__label" data-test-id="ad-slot-label">Advertisement</div>');
                }
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
