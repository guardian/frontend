const campaigns = [
    {
        name: 'Guardian Today UK',
        utm: 'GU Today main NEW H categories',
    },
    {
        name: 'Test Campaign',
        utm: 'test1212',
    },
];

const getEmailCampaignFromUtm = (utm) =>
    campaigns.find((campaign) => campaign.utm === utm);

const getEmailCampaignFromUrl = () => {
    const emailCampaignInUrl = (new window.URLSearchParams(
        window.location.search
    ).getAll('utm_campaign') || [''])[0];
    return getEmailCampaignFromUtm(emailCampaignInUrl);
};

export { campaigns, getEmailCampaignFromUtm, getEmailCampaignFromUrl };
