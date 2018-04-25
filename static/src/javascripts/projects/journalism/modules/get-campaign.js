// @flow
import config from 'lib/config';

export const getCampaign = () => {
    // eslint-disable-next-line
    const isCallout = campaign => campaign.fields._type === 'callout';
    const allCampaigns = config.get('page.campaigns');

    // targeting should become better once the campaigns tool works
    const allCallouts = allCampaigns.filter(isCallout);
    const campaignToShow = allCallouts.shift();

    if (campaignToShow !== undefined) {
        const {
            callout,
            description,
            formFields,
            formId,
        } = campaignToShow.fields;

        return {
            title: callout,
            description,
            formFields,
            formId,
        };
    }
};
