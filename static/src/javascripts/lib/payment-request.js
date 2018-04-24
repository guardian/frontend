// @flow

export const initPaymentRequest = (stripeKey: string, paymentApiUrl: string) => {
    const stripe = Stripe(stripeKey);

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
        fetch(paymentApiUrl, {
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
};


