// @flow
import config from 'lib/config';

const clean = (str: string): string => str.trim().toLowerCase();

export const campaignsFor = (id: string): Array<Object> => {
    try {
        return config.page.campaigns.filter(
            campaign =>
                campaign.fields &&
                clean(campaign.fields.campaignId) === clean(id)
        );
    } catch (e) {
        return [];
    }
};

export const isAbTestTargeted = (test: AcquisitionsABTest): boolean =>
    campaignsFor(test.campaignId).length > 0;
