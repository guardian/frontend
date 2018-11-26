// @flow
import fastdom from 'lib/fastdom-promise';
import template from 'lodash/template';
import campaignForm from 'raw-loader!journalism/views/campaignForm.html';
import { getCampaigns } from 'journalism/modules/get-campaign';
import { submitForm } from 'journalism/modules/submit-form';

const renderCampaign = (calloutNode: HTMLElement, calloutData): void => {
    const campaign = template(campaignForm)({ data: calloutData });
    const campaignDiv = `<figure class="element element-campaign">${campaign}</figure>`;

    console.log('render campaign happened');
    console.log('calloutdata =====>', calloutData);
    console.log('callout container ====>', calloutNode);

    fastdom
        .write(() => {
            calloutNode.innerHTML = campaignDiv;
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

const getCalloutContainers = () => {
    // callout container is a figure with data-alt property in the format: 'Callout callout-name' eg. 'Callout new-campaign-with-a-callout'
    const allEmbeds = document.querySelectorAll('figure.element-embed');
    return Array.from(allEmbeds).filter(el =>
        el
            .getAttribute('data-alt')
            .toLowerCase()
            .includes('callout')
    );
};

export const initCampaign = () => {
    const calloutDatasets = getCampaigns();
    const calloutContainers = getCalloutContainers();

    calloutContainers.forEach(container => {
        const containerDataAlt = container
            .getAttribute('data-alt')
            .toLowerCase();
        console.log('container id', containerDataAlt);
        console.log('dataset', calloutDatasets[0]);

        calloutDatasets.forEach(callout => {
            console.log(callout.id);
            if (containerDataAlt.includes(callout.id)) {
                renderCampaign(container, callout);
            }
        });
    });
};
