// @flow
import { makeAsyncABTest } from 'common/modules/commercial/contributions-utilities';

const abTestName = 'AcquisitionsEpicUsFromGoogleDoc';

export const acquisitionsEpicUsFromGoogleDoc: Promise<EpicABTest> = makeAsyncABTest({
    id: abTestName,
    campaignId: abTestName,

    start: '2018-04-17',
    expiry: '2019-06-05',

    author: 'Joseph Smith',
    description: 'Tests an epic with custom copy in US',
    successMeasure: 'Conversion rate',
    idealOutcome: 'Alternative copy makes more money than the control',

    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,

    // TODO: us
    locations: ['US'],

    // These come from the Google Doc instead
    variants: [],
}, 'https://interactive.guim.co.uk/docsdata-test/16xMIOovo3hIvV9U4KqcJc1-XTIuHM-b8yLwLbl_2AKA.json');
