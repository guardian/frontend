// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import config from 'lib/config';

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
                    const stripe = Stripe('pk_test_35RZz9AAyqErQshL410RDZMs');

                    const paymentRequest = stripe.paymentRequest({
                        country: 'GB',
                        currency: 'gbp',
                        total: {
                            label: 'Demo total',
                            amount: 100,
                        },
                    });

                    const elements = stripe.elements();
                    const prButton = elements.create('paymentRequestButton', {
                        paymentRequest: paymentRequest,
                    });

                    // Check the availability of the Payment Request API first.
                    paymentRequest.canMakePayment().then(function(result) {
                        if (result) {
                            prButton.mount('.js-payment-request-button');
                        } else {
                            const button = document.querySelector('.js-payment-request-button');
                            if (button instanceof HTMLElement) {
                                button.innerHTML = 'Payment Request API not available';
                            }
                            // document.getElementById('payment-request-button').style.display = 'none';
                        }
                    });

                    paymentRequest.on('token', function(ev) {
                        // Send the token to your server to charge it!
                        fetch('https://payment.code.dev-guardianapis.com/contribute/one-off/stripe/execute-payment', {
                            method: 'POST',
                            mode: 'cors',
                            body: JSON.stringify({
                                currency: 'GBP',
                                amount: 1,
                                token: ev.token.id,
                                email: 'joseph.smith@theguardian.com'
                            }),
                            headers: {'content-type': 'application/json'},
                        })
                        .then(function(response) {
                            if (response.ok) {
                                // Report to the browser that the payment was successful, prompting
                                // it to close the browser payment interface.
                                console.log('success!');
                                ev.complete('success');
                            } else {
                                // Report to the browser that the payment failed, prompting it to
                                // re-show the payment interface, or show an error message and close
                                // the payment interface.
                                console.log('fail');
                                console.log(response);
                                ev.complete('fail');
                            }
                        });
                    });

                }
            },
        },
    ],
});
