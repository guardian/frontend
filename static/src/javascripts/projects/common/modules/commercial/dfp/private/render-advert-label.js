define([
    'Promise',
    'common/utils/fastdom-promise',
    'common/utils/config',
    'common/utils/storage'
], function (
    Promise,
    fastdom,
    config,
    store
) {
    function renderAdvertLabel(adSlotNode) {
        if (shouldRenderLabel(adSlotNode)) {
            var labelInner = '';
            if (config.switches.abAdFeedback) {
                try {
                    var abParticipant = store.local.get('gu.ab.participations')['AdFeedback'];
                    if (abParticipant && abParticipant.variant === 'ad-feedback-variant') {
                        labelInner = '<div class="ad-slot__feedback">Feedback UI goes here</div>';
                    }
                } catch (x) {
                    // if we can't pull the ad feedback participation state, we'll treat it as excluded
                }
            }
            var labelDiv = '<div class="ad-slot__label" data-test-id="ad-slot-label">Advertisement' + labelInner + '</div>';
            return fastdom.write(function () {
                adSlotNode.insertAdjacentHTML('afterbegin', labelDiv);
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
