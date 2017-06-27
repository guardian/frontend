// @flow
import fastdom from 'lib/fastdom-promise';
import template from 'lodash/utilities/template';
import popupTemplate from 'raw-loader!commercial/views/ad-feedback-popup.html';
import tick from 'svgs/icon/tick.svg';
import { commercialFeatures } from 'commercial/modules/commercial-features';

const shouldRenderLabel = adSlotNode =>
    !(
        adSlotNode.classList.contains('ad-slot--fluid') ||
        adSlotNode.classList.contains('ad-slot--frame') ||
        adSlotNode.classList.contains('gu-style') ||
        adSlotNode.getAttribute('data-label') === 'false' ||
        adSlotNode.getElementsByClassName('ad-slot__label').length
    );

const renderAdvertLabel = (adSlotNode: any) => {
    if (shouldRenderLabel(adSlotNode)) {
        let feedbackPopup = '';
        let feedbackThanksMessage = '';
        if (commercialFeatures.adFeedback) {
            feedbackPopup = template(popupTemplate, {
                feedbackOptions: {
                    inappropriate: "It's offensive or inappropriate",
                    repetitive: 'I keep seeing this',
                    irrelevant: "It's not relevant to me",
                    useful: 'This advert was useful',
                },
                icon: tick.markup,
                slot: adSlotNode.id,
            });
            feedbackThanksMessage =
                '<i class="ad-feedback__thanks-message"> Thanks for your feedback </i>';
        }
        const labelDiv = `<div class="ad-slot__label">Advertisement${feedbackPopup}${feedbackThanksMessage}</div>`;
        return fastdom.mutate(() => {
            adSlotNode.insertAdjacentHTML('afterbegin', labelDiv);
        });
    }
    return Promise.resolve(null);
};

export default renderAdvertLabel;
