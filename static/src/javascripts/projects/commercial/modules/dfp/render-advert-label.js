// @flow
import fastdom from 'lib/fastdom-promise';
import template from 'lodash/utilities/template';
import popupTemplate from 'raw-loader!commercial/views/ad-feedback-popup.html';
import tick from 'svgs/icon/tick.svg';
import { commercialFeatures } from 'commercial/modules/commercial-features';

/* creatives can explicitly request to have - or to not have - an 'Advertisment' label added to them
 by containing a div with the following class followed by true/false.
 */
const labelRequiredSuffix = 'js-advertisement-label-required';

const shouldRenderLabel = adSlotNode => {
    const explicitlyOptedOut =
        adSlotNode.getElementsByClassName(`${labelRequiredSuffix}-false`)
            .length > 0;
    const explicitlyOptedIn =
        adSlotNode.getElementsByClassName(`${labelRequiredSuffix}-true`)
            .length > 0;

    return (
        explicitlyOptedIn ||
        (!explicitlyOptedOut &&
            !(
                adSlotNode.classList.contains('ad-slot--fluid') ||
                adSlotNode.classList.contains('ad-slot--frame') ||
                adSlotNode.getAttribute('data-label') === 'false' ||
                adSlotNode.getElementsByClassName('ad-slot__label').length
            ))
    );
};

const renderAdvertLabel = (adSlotNode: any): Promise<null> => {
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
        const labelDiv = `<div class="ad-slot__label">Advertisement${
            feedbackPopup
        }${feedbackThanksMessage}</div>`;
        return fastdom.write(() => {
            adSlotNode.insertAdjacentHTML('afterbegin', labelDiv);
        });
    }

    return Promise.resolve(null);
};

export default renderAdvertLabel;
