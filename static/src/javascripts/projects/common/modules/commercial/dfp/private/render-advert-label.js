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
                        var feedbackOpts = [
                            ['distracting'],
                            ['obscures', 'Obscures content'],
                            ['inappropriate'],
                            ['repetitive'],
                            ['irrelevant']
                        ].map(function(_) {
                            return '<li class="popup__item"><a><div class="popup__item-problem--option" slot="' + adSlotNode.id + '" problem="' + _[0] + '">' + (_[1] || _[0].replace(/^[a-z]/, function($1) { return $1.toUpperCase(); })) + '</div></a></li>';
                        }).join('');
                        var feedbackMenu = '<div class="ad-feedback popup popup--default popup__group is-off ' + adSlotNode.id + '__popup--feedback" id="ad-feedback-menu__' + adSlotNode.id + '" style="z-index: ' + zIndexOverlay + ';"><h3 class="ad-feedback popup__group-header"><p>Thank you for reporting this advert.</p><p>To help improve the ad experience on the Guardian, can you tell us why you\'re reporting it?</p></h3><ul>' + feedbackOpts + '</ul></div>';
                        labelInner = ' <a class="ad-feedback popup__toggle" data-toggle="' + adSlotNode.id + '__popup--feedback" aria-haspopup="true" aria-controls="ad-feedback-menu__' + adSlotNode.id + '">Report this ad</a>' + feedbackMenu;
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
