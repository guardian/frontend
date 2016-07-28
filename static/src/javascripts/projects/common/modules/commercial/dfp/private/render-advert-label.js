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
            var zIndexOverlay = 1050;
            var labelInner = '';
            if (config.switches.abAdFeedback) {
                try {
                    var abParticipant = store.local.get('gu.ab.participations')['AdFeedback'];
                    if (abParticipant && abParticipant.variant === 'ad-feedback-variant') {
                        var feedBackOpts = '<li class="popup__item"><a href="//feedback/report-ad?slot='+ adSlotNode.id +'&asset=' + 'TBC' + '&reason=distracting"><div class="popup__item-option-text">Distracting</div></a></li>';
                        feedBackOpts = feedBackOpts + '<li class="popup__item"><a href="//feedback/report-ad?slot='+ adSlotNode.id +'&asset=' + 'TBC' + '&reason=obscures-content"><div class="popup__item-option-text">Obscures content</div></a></li>';
                        feedBackOpts = feedBackOpts + '<li class="popup__item"><a href="//feedback/report-ad?slot='+ adSlotNode.id +'&asset=' + 'TBC' + '&reason=inappropriate"><div class="popup__item-option-text">Inappropriate</div></a></li>';
                        feedBackOpts = feedBackOpts + '<li class="popup__item"><a href="//feedback/report-ad?slot='+ adSlotNode.id +'&asset=' + 'TBC' + '&reason=repetitive"><div class="popup__item-option-text">Repetitive</div></a></li>';
                        feedBackOpts = feedBackOpts + '<li class="popup__item"><a href="//feedback/report-ad?slot='+ adSlotNode.id +'&asset=' + 'TBC' + '&reason=irrelevant"><div class="popup__item-option-text">Irrelevant</div></a></li>';
                        var feedbackMenu = '<div class="ad-feedback popup popup--default popup__group is-off ' + adSlotNode.id + '__popup--feedback" id="ad-feedback-menu__' + adSlotNode.id + '" style="z-index: ' + zIndexOverlay + ';"><h3 class="ad-feedback popup__group-header"><p>Thank you for reporting this advert.</p><p>To help us improve the ad experience, can you tell us why?</p></h3><ul>' + feedBackOpts + '</ul></div>';
                        labelInner = ' <a class="ad-feedback popup__toggle" data-toggle="' + adSlotNode.id + '__popup--feedback" aria-haspopup="true" aria-controls="ad-feedback-menu__' + adSlotNode.id + '">(Report this ad)</a>' + feedbackMenu;
                    }
                    if (labelInner.length > 0) {
                        adSlotNode.style.zIndex = zIndexOverlay;
                    }
                } catch (x) {
                    // if we can't pull the ad feedback participation state, we'll treat it as excluded
                }
            }
            var labelDiv = '<div class="ad-slot__label" data-test-id="ad-slot-label" style="z-index: 2010;">Advertisement' + labelInner + '</div>';
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
