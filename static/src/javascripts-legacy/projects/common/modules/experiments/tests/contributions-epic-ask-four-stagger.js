define([
    'common/modules/commercial/contributions-utilities'
], function (
    contributionsUtilities
) {

    return contributionsUtilities.makeABTest({
        id: 'ContributionsEpicAskFourStagger',
        campaignId: 'kr1_epic_ask_four_stagger',

        start: '2017-01-24',
        expiry: '2017-02-24',

        author: 'Jonathan Rankin',
        description: 'Test to see if imposing a minimum-time-between-impressions for the epic has a positive effect on conversion',
        successMeasure: 'Conversion rate',
        idealOutcome: 'We convert more supporters by spacing out Epic impressions',

        audienceCriteria: 'All',
        audience: 0.12,
        audienceOffset: 0,

        variants: [
            {
                id: 'control',
                maxViews: {
                    days: 30,
                    count: 4,
                    minDaysBetweenViews: 0
                },
                insertBeforeSelector: '.submeta',
                successOnView: true
            },

            {
                id: 'stagger_one_day',
                maxViews: {
                    days: 30,
                    count: 4,
                    minDaysBetweenViews: 1
                },
                insertBeforeSelector: '.submeta',
                successOnView: true
            },

            {
                id: 'stagger_three_days',
                maxViews: {
                    days: 30,
                    count: 4,
                    minDaysBetweenViews: 3
                },
                insertBeforeSelector: '.submeta',
                successOnView: true
            }
        ]
    });
});
