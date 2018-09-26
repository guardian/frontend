// @flow
import config from 'lib/config';

export const getCampaign = () => {
    // eslint-disable-next-line
    const isCallout = campaign => campaign.fields._type === 'callout';
    const allCampaigns = config.get('page.campaigns');

    // take the last added campaign as campaign to show
    const allCallouts = allCampaigns.filter(isCallout);
    const campaignToShow = allCallouts[allCallouts.length - 1];

    if (campaignToShow) {
        const {
            callout,
            description,
            formFields,
            formId,
        } = campaignToShow.fields;
        return {
            title: callout,
            description: description || `<p>&nbsp;</p>`,
            formFields,
            formId,
        };
    }
};
