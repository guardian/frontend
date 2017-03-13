define([
    'Promise',
    'lib/fastdom-promise',
    'lodash/utilities/template',
    'common/views/svgs',
    'raw-loader!commercial/views/ad-feedback-popup.html',
    'lib/config'
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
            var feedbackPopup = '', feedbackThanksMessage = '';
            if (config.switches.adFeedback) {
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
                feedbackThanksMessage = '<i class="ad-feedback__thanks-message"> Thanks for your feedback </i>';
            }
            var labelDiv = '<div class="ad-slot__label">Advertisement' +
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
