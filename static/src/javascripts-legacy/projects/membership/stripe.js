/* global StripeCheckout */
define([
    'lib/$',
    'bean',
    'lib/fetch',
    'lib/config',
    'fastdom'
], function ($, bean, fetch, config, fastdom) {

    var checkoutHandler = StripeCheckout.configure({
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

    function display(parent, card) {
        var $parent = $(parent);
        var $number = $('.js-manage-account-card', $parent);
        var $last4 = $('.js-manage-account-card-last4', $parent);
        var $type = $('.js-manage-account-card-type', $parent);
        var $button = $('.js-manage-account-change-card', $parent);
        var $updating = $('.js-updating', $parent);

        /*  show/hide
         *   once we've sent the token, we don't want to change the state of the dots until we redisplay
         * */
        var loading = function () {
            var HIDDEN = 'is-hidden';
            var $elems = [$button, $number, $type, $last4];
            var sent = false;
            var showDots = function () {
                if (sent) {
                    return;
                }
                $elems.forEach(function ($e) {
                    $e.addClass(HIDDEN);
                });
                $updating.removeClass(HIDDEN);
            };
            var hideDots = function () {
                if (sent) {
                    return;
                }
                $elems.forEach(function ($e) {
                    $e.removeClass(HIDDEN);
                });
                $updating.addClass(HIDDEN);
            };
            var send = function () {
                sent = true;
            };
            return {
                send: send,
                showDots: showDots,
                hideDots: hideDots
            };
        }();

        //Decode and display card
        var oldCardType = $type.data('type');
        var newCardType = 'i-' + card.type.toLowerCase().replace(' ', '-');

        bean.off($button[0], 'click');

        bean.on($button[0], 'click', handler());

        fastdom.write(function () {
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

            var product = $parent.data('product');
            var endpoint = config.page.userAttributesApiUrl + '/me/' + product + '-update-card';
            var email = $button.data('email');
            return function (e) {
                e.preventDefault();
                fastdom.write(loading.showDots);

                checkoutHandler.open({
                    email: email,
                    description: 'Update your card details',
                    panelLabel: 'Update',
                    token: update(endpoint),
                    closed: function () {
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
                window.addEventListener('popstate', function () {
                    checkoutHandler.close();
                });

            };
        }

        /* Takes the stripe token from callback and posts it to members data api
         * token: (one standard issue stripe token)
         *   -id: string of the stripe token id
         */
        function update(endpoint) {
            return function (token) {
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
                }).then(function(resp) {
                    var card = resp && resp.text();

                    display($parent, card);
                }).catch(function() {
                    $parent.text('We have not been able to update your card details at this time.');
                });
            };
        }
    }

    return {
        display: display
    };
});
