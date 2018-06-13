// @flow
import {makeABTest, makeGoogleDocEpicVariants} from 'common/modules/commercial/contributions-utilities';
import { getCopyFromGoogleDoc } from 'common/modules/commercial/acquisitions-copy';

const abTestName = 'AcquisitionsEpicFromGoogleDocFourVariants';

export const acquisitionsEpicFromGoogleDocFourVariants: EpicABTest = makeABTest(
    {
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
            ...makeGoogleDocEpicVariants(4)
        ],
    }
);
