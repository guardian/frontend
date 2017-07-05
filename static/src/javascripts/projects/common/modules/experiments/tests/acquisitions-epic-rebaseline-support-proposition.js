// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';

export const acquisitionsEpicRebaselineSupportProposition = makeABTest({
    id: 'AcquisitionsEpicRebaselineSupportProposition',
    campaignId: 'sandc_epic_rebaseline_support_proposition',

    start: '2017-07-05',
    expiry: '2017-08-05',

    author: 'Ap0c',
    description:
        'This creates a single-button version of the epic that links off to the new support frontend bundles landing page',
    successMeasure: 'Conversion rate',
    idealOutcome:
        'We get a baseline for conversion of the bundles landing page',

    audienceCriteria: 'UK all devices',
    audience: 0.1,
    audienceOffset: 0.9,

    variants: [
        {
            id: 'control',
            maxViews: {
                days: 30,
                count: 4,
                minDaysBetweenViews: 0,
            },

            useTailoredCopyForRegulars: true,
            insertAtSelector: '.submeta',
            successOnView: true,
        },
        {
            id: 'support_proposition',
            maxViews: {
                days: 30,
                count: 4,
                minDaysBetweenViews: 0,
            },

            useTailoredCopyForRegulars: true,
            insertAtSelector: '.submeta',
            successOnView: true,
        },
    ],
});
