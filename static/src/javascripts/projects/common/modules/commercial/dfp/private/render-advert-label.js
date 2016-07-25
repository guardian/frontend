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
                        var feedbackOpts = '<ul class="popup popup--default popup__group is-off" id="ad-feedback-menu__' + adSlotNode.id + '"><li class="popup__item">Offensive</li><li class="popup__item">Intrusive</li></ul>';
                        //TODO: correct styling
                        //TODO: No nbsp!
                        labelInner = '&nbsp;<a class="popup__toggle js-toggle-ready" aria-haspopup="true">(feedback)</a>' + feedbackOpts;
                    }
                } catch (x) {
                    // if we can't pull the ad feedback participation state, we'll treat it as excluded
                }
            }
            var labelDiv = '<div class="ad-slot__label has-popup" data-test-id="ad-slot-label">Advertisement' + labelInner + '</div>';
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
