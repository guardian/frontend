// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';

export const supportEpicCircles = makeABTest({
    id: 'SupportEpicCircles',
    campaignId: 'TBC-EPIC-TBC',

    start: '2018-02-21',
    expiry: '2018-03-29',

    author: 'Justin Pinner',
    description: 'Use the Epic to partition the audience for the support circles test',
    successMeasure: 'TBC',
    idealOutcome: 'We channel an even split of frontend traffic into the circles version of support',
    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,
    canRun: true,

    variants: [
        {
            id: 'variant',
            products: [],
            options: {
                campaignCode: 'gdnwb_copts_memco_sandc_circles_variant',
                isUnlimited: true,
            },
        },
        {
            id: 'control',
            products: [],
            options: {
                campaignCode: 'gdnwb_copts_memco_sandc_circles_control',
                isUnlimited: true,
            },
        },
    ],
});
