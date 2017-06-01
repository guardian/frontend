define([
    'common/modules/commercial/contributions-utilities',
], function (
    contributionsUtilities
) {



    return contributionsUtilities.makeABTest({
        id: 'AcquisitionsEpicAlwaysAskElection',
        campaignId: 'epic_always_ask_election',

        start: '2017-06-01',
        expiry: '2018-07-19',

        author: 'Jonathan Rankin',
        description: 'This will guarantee that the epic is always displayed on election stories',
        successMeasure: 'Conversion rate',
        idealOutcome: 'We can always show the epic on election articles',
        audienceCriteria: 'All',
        audience: 1,
        locations: ['GB'],
        audienceOffset: 0,
        useTargetingTool: true,

        variants: [
            {
                id: 'control',
                isUnlimited : true
            }
        ]
    });
});
