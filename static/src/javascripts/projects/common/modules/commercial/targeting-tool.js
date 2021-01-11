import config from 'lib/config';

const clean = (str) => str.trim().toLowerCase();

export const campaignsFor = (id) => {
    try {
        return config
            .get('page.campaigns', [])
            .filter(
                campaign =>
                    campaign.fields &&
                    clean(campaign.fields.campaignId) === clean(id)
            );
    } catch (e) {
        return [];
    }
};

export const isAbTestTargeted = (test) =>
    campaignsFor(test.campaignId).length > 0;
