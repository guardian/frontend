// @flow
import fastdom from 'lib/fastdom-promise';
import template from 'lodash/template';
import campaignForm from 'raw-loader!journalism/views/campaignForm.html';
import { getCampaigns } from 'journalism/modules/get-campaign';
import { submitForm } from 'journalism/modules/submit-form';

const renderCampaign = (anchorNode: HTMLElement, calloutData): void => {
    const campaign = template(campaignForm)({ data: calloutData });
    const campaignDiv = `<figure class="element element-campaign">${campaign}</figure>`;

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
    const calloutDatasets = getCampaigns();
    console.log(calloutDatasets);

    const calloutContainers = document.querySelectorAll('div[data-callout-id]');
    console.log(calloutContainers);

    // loop through containers and if id is found in a campaign data object, put that one in there

    calloutContainers.forEach(container => {
        const cId = container.getAttribute('data-callout-id');
        calloutDatasets.forEach(callout => {
            if (callout.id === cId) {
                renderCampaign(container, callout);
            }
        });
    });
};
