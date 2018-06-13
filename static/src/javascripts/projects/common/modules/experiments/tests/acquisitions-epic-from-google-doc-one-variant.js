// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import { getCopyFromGoogleDoc } from 'common/modules/commercial/acquisitions-copy';

const abTestName = 'AcquisitionsEpicFromGoogleDocOneVariant';

export const acquisitionsEpicFromGoogleDocOneVariant: EpicABTest = makeABTest({
    id: abTestName,
    campaignId: abTestName,

    start: '2018-04-17',
    expiry: '2019-06-05',

    author: 'Jonathan Rankin',
    description: 'Always ask on this specific story',
    successMeasure: 'Conversion rate',
    idealOutcome: 'Always ask on this story',

    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,

    variants: [
        {
            id: 'control',
            products: [],
        },
        {
            id: 'variant_1',
            products: [],
            options: {
                copy: getCopyFromGoogleDoc(
                    'https://interactive.guim.co.uk/docsdata-test/1Hoqzg-LeB0xJf2z0JwsfDTHdXKtq-7O5DsQhpqRm7ho.json',
                    'variant_1'
                ),
            },
        },
    ],
});
