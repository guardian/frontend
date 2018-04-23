// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { keywordExists } from 'lib/page';
import fetchJSON from "../../../../../lib/fetch-json";

const abTestName = 'AcquisitionsEpicAlwaysAskFromGoogleDoc';

const getCopyFromGoogleDoc = (url: string): Promise<AcquisitionsEpicTemplateCopy> =>
    fetchJSON(url, {
        mode: 'cors',
    }).then(res => ({
        heading: res.sheets.Sheet1[0].heading,
        p1: res.sheets.Sheet1[0].p1,
        p2: res.sheets.Sheet1[0].p2
    }));

export const acquisitionsEpicAlwaysAskFromGoogleDoc: EpicABTest = makeABTest({
    id: abTestName,
    campaignId: abTestName,

    start: '2018-04-17',
    expiry: '2018-06-05',

    author: 'Jonathan Rankin',
    description: 'Always ask on this specific story',
    successMeasure: 'Conversion rate',
    idealOutcome: 'Always ask on this story',

    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,
    canRun: () => keywordExists(['Cambridge Analytica']),

    variants: [
        // {
        //     id: 'control',
        //     products: [],
        //     options: {
        //         isUnlimited: true,
        //     }
        // },
        {
            id: 'custom_copy',
            products: [],
            options: {
                isUnlimited: true,
                testimonialBlock: '',
                copy: getCopyFromGoogleDoc('https://interactive.guim.co.uk/docsdata-test/1Hoqzg-LeB0xJf2z0JwsfDTHdXKtq-7O5DsQhpqRm7ho.json')
            },
        },
    ],
});
