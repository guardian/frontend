define([
    'common/modules/commercial/contributions-utilities'
], function (
    contributionsUtilities
) {
    return contributionsUtilities.makeABTest({
        id: 'AcquisitionsEpicAlwaysAskWithTag',
        campaignId: 'epic_always_ask_with_tag',

        start: '2017-05-25',
        expiry: '2018-07-19',
        useTargetingTool: true,
        author: 'Jonathan Rankin',
        description: 'This guarantees that any on any article that is tagged with a tag that is on the allowed list of tags as set by the tagging tool, the epic will be displayed',
        successMeasure: 'Acquisitions',
        idealOutcome: 'We have the ability to turn the epic to always on for specific tags',
        audienceCriteria: 'All',
        audience: 1.0,
        showForSensitive: true,
        audienceOffset: 0,

        variants: [
            {
                id: 'control'
            }
        ]
    });
});
