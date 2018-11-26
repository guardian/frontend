// @flow
import config from 'lib/config';

export const getCampaigns = () => {
    // eslint-disable-next-line
    const isCallout = campaign => campaign.fields._type === 'callout';
    const allCampaigns = config.get('page.campaigns');
    const allCallouts = allCampaigns.filter(isCallout);

    console.log('allcallouts', allCallouts);

    return allCallouts.map(callout => ({
        name: callout.name,
        title: callout.fields.callout,
        description: callout.fields.description || `<p>&nbsp;</p>`,
        formFields: callout.fields.formFields,
        formId: callout.fields.formId,
    }));
};
