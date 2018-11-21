// @flow

const thankYouEpic = `
    <div>
        <h2 class="contributions__title contributions__title--epic">
            Thank you …
        </h2>
        <p class="contributions__paragraph contributions__paragraph--epic">
            … for supporting us, by funding our independent journalism and helping to keep it open.
            Your contribution and the similar pledges of more than 800,000 readers around the world
            enables the Guardian’s journalists to find things out, reveal new information and challenge
            the powerful. Your knowledge and experience makes our reporting better too. Did you know
            we publish articles and podcasts for our supporters, featuring your views and voices?
        </p>

        <a href="#" target="_blank" class="u-underline">You can learn more about how to get involved here.</a>
    </div>
`;

export const initPaymentRequest = (stripeKey: string, paymentApiUrl: string) => {
    const stripe = Stripe(stripeKey);

    const paymentRequest = stripe.paymentRequest({
        country: 'GB',
        currency: 'gbp',
        total: {
            label: 'One-off contribution to The Guardian',
            // TODO: allow user to choose amount!
            // You can update the amount later by using:
            // https://stripe.com/docs/stripe-js/reference#payment-request-update
            amount: 100,
        },
        requestPayerEmail: true,
        // we don't need the below since we don't send this for one-off payments
        // requestPayerName: true,
    });

    const elements = stripe.elements();
    const prButton = elements.create('paymentRequestButton', {
        paymentRequest: paymentRequest,
        style: {
            paymentRequestButton: {
                type: 'donate',
            },
        },
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
                email: ev.payerEmail,
            }),
            headers: {'content-type': 'application/json'},
        })
        .then(function(response) {
            if (response.ok) {
                // Report to the browser that the payment was successful, prompting
                // it to close the browser payment interface.
                console.log('success!');
                ev.complete('success');
                const epic = document.querySelector('.contributions__epic');
                if (epic instanceof HTMLElement) {
                    epic.innerHTML = thankYouEpic;
                }
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


