define([
    'Promise',
    'common/utils/fastdom-promise',
    'common/utils/template',
    'common/views/svgs',
    'text!commercial/views/ad-feedback-popup.html',
    'common/utils/config'
], function (
    Promise,
    fastdom,
    template,
    svgs,
    popupTemplate,
    config
) {
    function renderAdvertLabel(adSlotNode) {
        if (shouldRenderLabel(adSlotNode)) {
            var zIndexOverlay = 1050;
            var feedbackPopup = '';
            if (config.switches.adFeedback) {
                adSlotNode.style.zIndex = zIndexOverlay;
                feedbackPopup = template(popupTemplate, {
                    feedbackOptions: {
                        'distracting': 'Distracting',
                        'obscures' : 'Obscures content',
                        'inappropriate': 'Inappropriate',
                        'repetitive': 'Repetitive',
                        'irrelevant': 'Irrelevant'
                    },
                    icon: svgs('tick'),
                    slot: adSlotNode.id
                });
            }
            var feedbackThanksMessage = '<i class="ad-feedback__thanks-message"> Thanks for your feedback </i>'
            var labelDiv = '<div class="ad-slot__label" data-test-id="ad-slot-label" style="z-index: 2010;">Advertisement' +
                feedbackPopup + feedbackThanksMessage +
                '</div>';
            return fastdom.write(function () {
                adSlotNode.insertAdjacentHTML('afterbegin', labelDiv);
            });
        } else {
            return Promise.resolve(null);
        }
    }

    function shouldRenderLabel(adSlotNode) {
        return !(
            adSlotNode.classList.contains('ad-slot--fluid') ||
            adSlotNode.classList.contains('ad-slot--frame') ||
            adSlotNode.classList.contains('gu-style') ||
            adSlotNode.getAttribute('data-label') === 'false' ||
            adSlotNode.getElementsByClassName('ad-slot__label').length
        );
    }

    return renderAdvertLabel;
});
