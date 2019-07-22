// @flow
import {
    makeEpicABTest,
    defaultButtonTemplate,
} from 'common/modules/commercial/contributions-utilities';
import { getSync as geolocationGetSync } from 'lib/geolocation';

export const acquisitionsEpicAlwaysAskIfTagged = makeEpicABTest({
    id: 'AcquisitionsEpicAlwaysAskIfTagged',
    campaignId: 'epic_always_ask_if_tagged',

    geolocation: geolocationGetSync(),
    highPriority: false,

    start: '2017-05-23',
    expiry: '2020-01-27',

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
    pageCheck: page =>
        page.contentType === 'Article' || page.contentType === 'Interactive',

    variants: [
        {
            id: 'control',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],

            deploymentRules: 'AlwaysAsk',
            buttonTemplate: defaultButtonTemplate,
        },
    ],
});
