// @flow
import {
    makeEpicABTest,
    defaultButtonTemplate,
} from 'common/modules/commercial/contributions-utilities';
import { getSync as geolocationGetSync } from 'lib/geolocation';

export const askFourEarning: EpicABTest = makeEpicABTest({
    id: 'ContributionsEpicAskFourEarning',
    campaignId: 'kr1_epic_ask_four_earning',

    geolocation: geolocationGetSync(),
    highPriority: false,

    start: '2017-01-24',
    expiry: '2020-01-27',

    author: 'Jonathan Rankin',
    description:
        'This places the epic on all articles for all users, with a limit of 4 impressions in any given 30 days',
    successMeasure: 'Conversion rate',
    idealOutcome: 'Acquires many Supporters',

    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,

    variants: [
        {
            id: 'control',
            products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
            buttonTemplate: defaultButtonTemplate,
        },
    ],
});
