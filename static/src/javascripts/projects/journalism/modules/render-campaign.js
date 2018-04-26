// @flow
import fastdom from 'lib/fastdom-promise';
import template from 'lodash/utilities/template';
import campaignForm from 'raw-loader!journalism/views/campaignForm.html';
import { getCampaign } from 'journalism/modules/get-campaign';
import { submitForm } from 'journalism/modules/submit-form';

const renderCampaign = (anchorNode: HTMLElement, calloutData): void => {
    const campaign = template(campaignForm, { data: calloutData });
    const campaignDiv = `<figure class="element element-campaign">${
        campaign
    }</figure>`;

    fastdom
        .write(() => {
            anchorNode.insertAdjacentHTML('afterend', campaignDiv);
        })
        .then(() => {
            const cForm = document.querySelector(
                '.element-campaign .campaign .campaign--snippet__body'
            );
            if (cForm) {
                cForm.addEventListener('submit', submitForm);
            }
        });
};

export const initCampaign = () => {
    const calloutData = getCampaign();

    const fourthParagraph = document.querySelector(
        '.content__article-body p:nth-of-type(4)'
    );
    if (calloutData && fourthParagraph)
        renderCampaign(fourthParagraph, calloutData);
};
