define([
    'lib/config',
], function(
    config
) {
    function clean(string) {
        return string.trim().toLowerCase();
    }

    /**
     * Get the campaigns for a test.
     *
     * @param test      an A/B test object (with an 'id' property)
     * @return {Array}  campaigns associated with this test
     */
    function campaignsFor(id) {
        try {
            return config.page.campaigns.filter(function (campaign) {
                return campaign.fields && clean(campaign.fields.campaignId) === clean(id);
            });
        } catch (e) {
            return [];
        }
    }

    /**
     * Check if any of the active campaigns (from the targeting tool) apply to a given A/B test.
     *
     * @param test        an A/B test object (with an 'id' property)
     * @return {Boolean}
     */
    function isAbTestTargeted(campaignId) {
        return campaignsFor(campaignId).length > 0;
    }

    return {
        isAbTestTargeted: isAbTestTargeted
    };
});
