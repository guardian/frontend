define([
    'common/modules/commercial/contributions-utilities',
], function (
    contributionsUtilities
) {



    return contributionsUtilities.makeABTest({
        id: 'AcquisitionsEpicAlwaysAskIfTagged',
        campaignId: 'epic_always_ask_if_tagged',

        start: '2017-05-23',
        expiry: '2018-07-19',

        author: 'Jonathan Rankin',
        description: 'This guarantees that any on any article that is tagged with a tag that is on the allowed list of tags as set by the tagging tool, the epic will be displayed',
        successMeasure: 'Conversion rate',
        idealOutcome: 'We can always show the epic on articles with a pre selected tag',
        audienceCriteria: 'All',
        audience: 1,
        audienceOffset: 0,
        showForSensitive: true,
        useTargetingTool: true,


        variants: [
            {
                id: 'control',
                isUnlimited : true,
                successOnView: true,
            }
        ]
    });
});
