define([
    'common/modules/commercial/contributions-utilities'
], function (
    contributionsUtilities
) {

    return contributionsUtilities.makeABTest({
        id: 'ContributionsEpicLaundromat',
        campaignId: 'epic_laundromat',

        start: '2017-03-20',
        expiry: '2017-04-13',

        author: 'Jonathan Rankin',
        description: 'Run the epic on laundromat articles, ignoring the sensitive tag',
        successMeasure: 'Conversion rate',
        idealOutcome: 'The conversion rate is equal or above what we have observed on other campaigns',
        showForSensitive: true,
        audienceCriteria: 'All',
        audience: 1,
        audienceOffset: 0,
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
