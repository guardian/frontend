// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';

export const acquisitionsEpicAlwaysAskIfTagged = makeABTest({
    id: 'AcquisitionsEpicAlwaysAskIfTagged',
    campaignId: 'epic_always_ask_if_tagged',

    start: '2017-05-23',
    expiry: '2018-07-19',

    author: 'Jonathan Rankin',
    description:
        'This guarantees that any on any article that is tagged with a tag that is on the allowed list of tags as set by the tagging tool, the epic will be displayed',
    successMeasure: 'Conversion rate',
    idealOutcome:
        'We can always show the epic on articles with a pre selected tag',
    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,
    useTargetingTool: true,

    variants: [
        {
            id: 'control',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],

            options: {
                isUnlimited: true,
                successOnView: true,
                useTailoredCopyForRegulars: true,
            },
        },
    ],
});
