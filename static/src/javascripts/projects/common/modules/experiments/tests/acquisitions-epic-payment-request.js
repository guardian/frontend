// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import config from 'lib/config';
import { initPaymentRequest } from 'lib/payment-request';

const abTestName = 'AcquisitionsEpicPaymentRequest';


export const acquisitionsEpicPaymentRequest: EpicABTest = makeABTest({
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
    canRun: () => config.get('page.contentId', '') === 'environment/2016/apr/29/revitalised-and-calmed-by-an-english-wood-in-spring',

    variants: [
        {
            id: 'always_ask',
            products: [],
            options: {
                isUnlimited: true,
                buttonTemplate: () => '<div class="js-payment-request-button"></div>',
                onInsert: () => {
                    initPaymentRequest(
                        'pk_test_35RZz9AAyqErQshL410RDZMs',
                        'https://payment.code.dev-guardianapis.com/contribute/one-off/stripe/execute-payment'
                    );
                }
            },
        },
    ],
});
