// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';

export const askFourEarning: EpicABTest = makeABTest({
    id: 'ContributionsEpicAskFourEarning',
    campaignId: 'kr1_epic_ask_four_earning',

    start: '2017-01-24',
    expiry: '2018-07-19',

    author: 'Jonathan Rankin',
    description:
        'This places the epic on all articles for all users, with a limit of 4 impressions in any given 30 days',
    successMeasure: 'Conversion rate',
    idealOutcome: 'Acquires many Supporters',

    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,
    locations: ['GB'],


    variants: [
        {
            id: 'control',
            products: [],
        },
        {
            id: 'referrer',
            products: [],
        },
    ],
});
