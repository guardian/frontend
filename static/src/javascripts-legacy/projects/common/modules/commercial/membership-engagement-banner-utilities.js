define([
        'lib/config',
        'lib/storage',
        'lodash/objects/assign'
    ], function(config,
                storage,
                assign) {

    function selectSequentiallyFrom(array) {
        return array[storage.local.get('gu.alreadyVisited') % array.length];
    }

    var MEMBERSHIP = 'membership';
    var CONTRIBUTIONS = 'contributions';

    var baseParams = {
        minArticles: 3,
        colourStrategy: function() {
            return 'membership-prominent ' + selectSequentiallyFrom(['yellow', 'purple', 'bright-blue', 'dark-blue']);
        }
    };

    var membershipParams = assign({}, baseParams, {
        buttonCaption: 'Become a Supporter',
        linkUrl: 'https://membership.theguardian.com/supporter',
        offering: MEMBERSHIP
    });

    var contributionParams = assign({}, baseParams, {
        buttonCaption: 'Make a Contribution',
        linkUrl: 'https://contribute.theguardian.com/',
        offering: CONTRIBUTIONS
    });

    var defaultParamsLookup = {

        UK: assign({}, membershipParams, {
            messageText: 'For less than the price of a coffee a week, you could help secure the Guardian’s future. Support our journalism for £5 a month.',
            campaignCode: "mem_uk_banner"
        }),

        US: assign({}, contributionParams, {
            messageText: 'If you use it, if you like it, then why not pay for it? It’s only fair.',
            campaignCode: "cont_us_banner"
        }),

        AU: assign({}, membershipParams, {
            messageText: 'We need you to help support our fearless independent journalism. Become a Guardian Australia member for just $10 a month.',
            campaignCode: "mem_au_banner"
        }),

        INT: assign({}, membershipParams, {
            messageText: 'For less than the price of a coffee a week, you could help secure the Guardian\'s future. Support our journalism for $7 / €5 a month.',
            campaignCode: "mem_int_banner"
        })
    };

    var defaultParams = defaultParamsLookup[config.page.edition];

    var offerings = {
        membership: MEMBERSHIP,
        contributions: CONTRIBUTIONS
    };

    return {
        defaultParams: defaultParams,
        offerings: offerings
    }
});
