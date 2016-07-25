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
                        var feedBackOpts = '<span>Tell us why you\'re reporting this advertisement</span><hr/><li class="popup__item">It\'s offensive</li>';
                        feedBackOpts = feedBackOpts + '<li class="popup__item">Makes a sound</li>';
                        feedBackOpts = feedBackOpts + '<li class="popup__item">Too much movement</li>';
                        feedBackOpts = feedBackOpts + '<li class="popup__item">Not relevant</li>';
                        feedBackOpts = feedBackOpts + '<li class="popup__item">Other</li>';
                        var feedbackMenu = '<ul class="popup popup--default popup__group is-off ' + adSlotNode.id + '__popup--feedback" id="ad-feedback-menu__' + adSlotNode.id + '">' + feedBackOpts + '</ul>';
                        //TODO: correct styling
                        labelInner = ' <a class="popup__toggle" data-toggle="' + adSlotNode.id + '__popup--feedback" aria-haspopup="true" aria-controls="ad-feedback-menu__' + adSlotNode.id + '">(Report this ad)</a>' + feedbackMenu;
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
