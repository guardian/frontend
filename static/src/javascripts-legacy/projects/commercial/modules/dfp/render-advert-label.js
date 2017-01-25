define([
    'Promise',
    'common/utils/fastdom-promise',
    'common/utils/template',
    'text!commercial/views/ad-feedback-popup.html',
    'common/utils/config'
], function (
    Promise,
    fastdom,
    template,
    popupTemplate,
    config
) {
    function renderAdvertLabel(adSlotNode) {
        if (shouldRenderLabel(adSlotNode)) {
            var zIndexOverlay = 1050;
            var labelInner = '';
            if (config.switches.adFeedback) {
                adSlotNode.style.zIndex = zIndexOverlay;
                labelInner = template(popupTemplate, {
                    feedbackOptions: {
                        'distracting': 'Distracting',
                        'obscures' : 'Obscures content',
                        'inappropriate': 'Inappropriate',
                        'repetitive': 'Repetitive',
                        'irrelevant': 'Irrelevant'
                    },
                    slot: adSlotNode.id
                });
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
            adSlotNode.classList.contains('ad-slot--fluid') ||
            adSlotNode.classList.contains('ad-slot--frame') ||
            adSlotNode.classList.contains('gu-style') ||
            adSlotNode.getAttribute('data-label') === 'false' ||
            adSlotNode.getElementsByClassName('ad-slot__label').length
        );
    }

    return renderAdvertLabel;
});
