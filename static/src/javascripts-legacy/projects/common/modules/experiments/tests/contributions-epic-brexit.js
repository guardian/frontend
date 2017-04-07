define([
    'common/modules/commercial/contributions-utilities'
], function (
    contributionsUtilities
) {

    return contributionsUtilities.makeABTest({
        id: 'ContributionsEpicBrexit',
        campaignId: 'epic_brexit_2017_01',

        start: '2017-01-06',
        expiry: '2017-04-15',

        author: 'Alex Dufournet',
        description: 'Test whether we get a positive effect on membership/contribution by targeting the latest brexit articles',
        successMeasure: 'Conversion rate',
        idealOutcome: 'The conversion rate is equal or above what we have observed on other campaigns',

        audienceCriteria: 'All',
        audience: 0.88,
        audienceOffset: 0.12,
        useTargetingTool: true,

        variants: [
            {
                id: 'control',
                maxViews: {
                    days: 7,
                    count: 6,
                    minDaysBetweenViews: 1
                },
                insertBeforeSelector: '.submeta',
                successOnView: true
            }
        ]
    });
});
