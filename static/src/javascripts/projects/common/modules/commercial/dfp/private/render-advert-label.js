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
                        var feedBackOpts = '<li class="popup__item"><a href="//feedback/report-ad?slot='+ adSlotNode.id +'&asset=' + 'TBC' + '&reason=offensive">It\'s offensive</a></li>';
                        feedBackOpts = feedBackOpts + '<li class="popup__item"><a href="//feedback/report-ad?slot='+ adSlotNode.id +'&asset=' + 'TBC' + '&reason=makes-a-sound">Makes a sound</a></li>';
                        feedBackOpts = feedBackOpts + '<li class="popup__item"><a href="//feedback/report-ad?slot='+ adSlotNode.id +'&asset=' + 'TBC' + '&reason=too-much-movement">Too much movement</a></li>';
                        feedBackOpts = feedBackOpts + '<li class="popup__item"><a href="//feedback/report-ad?slot='+ adSlotNode.id +'&asset=' + 'TBC' + '&reason=not-relevant">Not relevant</a></li>';
                        var feedbackMenu = '<div class="ad-feedback popup popup--default popup__group is-off ' + adSlotNode.id + '__popup--feedback" id="ad-feedback-menu__' + adSlotNode.id + '"><h3 class="ad-feedback popup__group-header"><strong>Thank you.</strong></h3><h3 class="ad-feedback popup__group-header">Could you tell us why you reported this advert?</h3><ul>' + feedBackOpts + '</ul></div>';
                        labelInner = ' <a class="ad-feedback popup__toggle" data-toggle="' + adSlotNode.id + '__popup--feedback" aria-haspopup="true" aria-controls="ad-feedback-menu__' + adSlotNode.id + '">(Report this ad)</a>' + feedbackMenu;
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
