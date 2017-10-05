/* global StripeCheckout */
import $ from 'lib/$';
import bean from 'bean';
import fetch from 'lib/fetch';
import config from 'lib/config';
import fastdom from 'fastdom';

const checkoutHandler = StripeCheckout.configure({
    key: config.page.stripePublicToken,
    locale: 'auto',
    name: 'The Guardian',
    allowRememberMe: false,
    image: 'https://d24w1tjgih0o9s.cloudfront.net/gu.png'
});

/* Renders the card details
 *  card:
 *   -last4: string of last 4 digits of cc
 *   -type:  string of card type (capitalised)
 *   */

function display(parent, card, key) {
    const $parent = $(parent);
    const $number = $('.js-manage-account-card', $parent);
    const $last4 = $('.js-manage-account-card-last4', $parent);
    const $type = $('.js-manage-account-card-type', $parent);
    const $button = $('.js-manage-account-change-card', $parent);
    const $updating = $('.js-updating', $parent);

    key = key || config.page.stripePublicToken;
    /*  show/hide
     *   once we've sent the token, we don't want to change the state of the dots until we redisplay
     * */
    const loading = (() => {
        const HIDDEN = 'is-hidden';
        const $elems = [$button, $number, $type, $last4];
        let sent = false;
        const showDots = () => {
            if (sent) {
                return;
            }
            $elems.forEach($e => {
                $e.addClass(HIDDEN);
            });
            $updating.removeClass(HIDDEN);
        };
        const hideDots = () => {
            if (sent) {
                return;
            }
            $elems.forEach($e => {
                $e.removeClass(HIDDEN);
            });
            $updating.addClass(HIDDEN);
        };
        const send = () => {
            sent = true;
        };
        return {
            send,
            showDots,
            hideDots
        };
    })();

    //Decode and display card
    const oldCardType = $type.data('type');
    const newCardType = 'i-' + card.type.toLowerCase().replace(' ', '-');

    bean.off($button[0], 'click');

    bean.on($button[0], 'click', handler());

    fastdom.write(() => {
        if (oldCardType) {
            $type.removeClass(oldCardType);
        }
        $last4.text(card.last4);
        $type.addClass(newCardType);
        $type.data('type', newCardType);
        $parent.removeClass('is-hidden');
        loading.hideDots();
    });


    /*
     * Closes over the event handler for the Change Card button
     */
    function handler() {

        const product = $parent.data('product');
        const endpoint = config.page.userAttributesApiUrl + '/me/' + product + '-update-card';
        const email = $button.data('email');
        return e => {
            e.preventDefault();
            fastdom.write(loading.showDots);

            checkoutHandler.open({
                key,
                email,
                description: 'Update your card details',
                panelLabel: 'Update',
                token: update(endpoint),
                closed() {
                    fastdom.write(loading.hideDots);
                }
            });
            /*
             Nonstandard javascript alert:
             This is part of stripes recommended checkout integration,
             it does assume some things about the browser.
             However- this assumption and more are likely to exist in their code.

             https://stripe.com/docs/checkout#integration-custom

             Close Checkout on page navigation: */
            window.addEventListener('popstate', () => {
                checkoutHandler.close();
            });

        };
    }

    /* Takes the stripe token from callback and posts it to members data api
     * token: (one standard issue stripe token)
     *   -id: string of the stripe token id
     */
    function update(endpoint) {
        return token => {
            loading.send();
            fetch(endpoint, {
                mode: 'cors',
                credentials: 'include',
                method: 'post',
                headers: {
                    'Csrf-Token': 'nocheck'
                },
                body: {
                    stripeToken: token.id
                },
            }).then(resp => resp.json()).then(json => {
                const card = json;
                display($parent, card);
            }).catch(() => {
                $parent.text('We have not been able to update your card details at this time.');
            });
        };
    }
}

export default {
    display
};
