import config from 'lib/config';

const clean = (str: string) => str.trim().toLowerCase();

const campaignsFor = (id: string): Array<object> => {
    try {
        return config.page.campaigns.filter(campaign =>
            campaign.fields && clean(campaign.fields.campaignId) === clean(id)
        );
    } catch (e) {
        return [];
    }
};

const isAbTestTargeted = (test: ABTest): boolean => campaignsFor(test.campaignId).length > 0;

export default {
    isAbTestTargeted,
    campaignsFor
};
