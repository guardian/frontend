define([
        'lib/config',
        'lib/storage',
        'lodash/objects/assign',
        'lib/geolocation'
    ], function(
        config,
        storage,
        assign,
        geolocation
    ) {

    var offerings = {
        membership: 'membership',
        contributions: 'contributions'
    };

    var baseParams = {
        minArticles: 3,
        colourStrategy: function() {
            return 'membership-prominent yellow'
        },
        campaignCode: 'gdnwb_copts_memco_banner',
        // Used for tracking the new implementation by querying the interactions field.
        interactionOnMessageShow: {
            component: 'engagement_banner',
            value: 'default_paypal_and_paywall'
        }
    };

    function engagementBannerCopy(cta) {
        return 'Unlike many others, we haven\'t put up a paywall - we want to keep our journalism as open as we can. ' + cta
    }

    // Prices taken from https://membership.theguardian.com/<region>/supporter
    function monthlySupporterCost(location) {

        var region = geolocation.getSupporterPaymentRegion(location);

        if (region === 'EU') {

            // Format either 4.99 € or €4.99 depending on country
            // See https://en.wikipedia.org/wiki/Linguistic_issues_concerning_the_euro
            var euro = '€';
            var amount = '4.99';
            var euroAfterCountryCodes = [
                'BG',
                'HR',
                'CZ',
                'EE',
                'FI',
                'FR',
                'DE',
                'GR',
                'HU',
                'IS',
                'IT',
                'LV',
                'LT',
                'PL',
                'PT',
                'RO',
                'SK',
                'SI',
                'ES',
                'SE'
            ];

            return euroAfterCountryCodes.includes(location) ? amount + ' ' + euro : euro + amount;

        } else {

            var payment = {
                GB:  '£5',
                US:  '$6.99',
                AU:  '$10',
                CA:  '$6.99',
                INT: '$6.99'
            }[region];

            return payment || '£5'
        }
    }

    function supporterEngagementBannerCopy(location) {
        return engagementBannerCopy('Support us for ' + monthlySupporterCost(location) + ' per month.')
    }

    function contributionEngagementBannerCopy() {
        return engagementBannerCopy('Support us with a one-off contribution')
    }

    function supporterParams(location) {
        return assign({}, baseParams, {
            buttonCaption: 'Become a Supporter',
            linkUrl: 'https://membership.theguardian.com/supporter',
            offering: offerings.membership,
            messageText: supporterEngagementBannerCopy(location)
        })
    }

    function contributionParams() {
        return assign({}, baseParams, {
            buttonCaption: 'Make a Contribution',
            linkUrl: 'https://contribute.theguardian.com',
            offering: offerings.contributions,
            messageText: contributionEngagementBannerCopy()
        });
    }

    function engagementBannerParams(location) {
        return location === 'US' ? contributionParams() : supporterParams(location);
    }

    return {
        defaultParams: engagementBannerParams,
        offerings: offerings
    }
});
