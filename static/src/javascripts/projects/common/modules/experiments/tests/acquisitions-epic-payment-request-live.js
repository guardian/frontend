// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import config from 'lib/config';
import { initPaymentRequest } from 'lib/payment-request';

const abTestName = 'AcquisitionsEpicPaymentRequestLive';


export const acquisitionsEpicPaymentRequestLive: EpicABTest = makeABTest({
    id: abTestName,
    campaignId: abTestName,

    start: '2018-04-17',
    expiry: '2018-11-05',

    author: 'Joseph Smith',
    description: 'Payment Request API',
    successMeasure: 'Conversion rate',
    idealOutcome: 'Lots of money',

    audienceCriteria: 'All',
    audience: 1,
    audienceOffset: 0,
    canRun: () => config.get('page.contentId', '') === 'environment/2018/apr/23/country-diary-perplexed-by-a-sign-of-the-tides',

    variants: [
        {
            id: 'always_ask',
            products: [],
            options: {
                isUnlimited: true,
                buttonTemplate: () => '<div class="js-payment-request-button"></div>',
                onInsert: () => {
                    initPaymentRequest(
                        'pk_live_auSwLB4KBzbN3JOUVHvKMe6f',
                        'https://payment.guardianapis.com/contribute/one-off/stripe/execute-payment'
                    );
                }
            },
        },
    ],
});
