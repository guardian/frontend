// @flow
import fastdom from 'lib/fastdom-promise';
import template from 'lodash/utilities/template';
import campaignForm from 'raw-loader!journalism/views/campaignForm.html';
import { getCampaign } from 'journalism/modules/get-campaign';
import { submitForm } from 'journalism/modules/submit-form';

const renderCampaign = (anchorNode: HTMLElement): void => {
    const campaign = template(campaignForm, { data: getCampaign() });
    const campaignDiv = `<figure class="element element-campaign">${
        campaign
    }</figure>`;

    fastdom
        .write(() => {
            anchorNode.insertAdjacentHTML('afterend', campaignDiv);
        })
        .then(() => {
            const cForm = anchorNode.querySelector('.campaign form');
            if (cForm) {
                cForm.addEventListener('submit', submitForm);
            }
        });
};

export const initCampaign = () => {
    const fourthParagraph = document.querySelector(
        '.content__article-body p:nth-of-type(4)'
    );
    if (fourthParagraph) renderCampaign(fourthParagraph);
};
