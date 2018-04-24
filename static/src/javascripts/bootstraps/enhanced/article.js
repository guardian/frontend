// @flow
/* eslint-disable no-new */
import config from 'lib/config';
import qwery from 'qwery';
import $ from 'lib/$';
import { catchErrorsWithContext } from 'lib/robust';
import { isBreakpoint } from 'lib/detect';
import mediator from 'lib/mediator';
import { getUrlVars } from 'lib/url';
import {
    insertTagRichLink,
    upgradeRichLinks,
} from 'common/modules/article/rich-links';
import { upgradeMembershipEvents } from 'common/modules/article/membership-events';
import { geoMostPopular } from 'common/modules/onward/geo-most-popular';
import { handleCompletion as handleQuizCompletion } from 'common/modules/atoms/quiz';
import { init as initLiveblogCommon } from 'bootstraps/enhanced/article-liveblog-common';
import { initTrails } from 'bootstraps/enhanced/trail';
import { optInEngagementBannerInit } from 'common/modules/identity/global/opt-in-engagement-banner';
import ophan from 'ophan/ng';

const modules = {
    initCmpParam() {
        const allvars = getUrlVars();

        if (allvars.CMP) {
            $('.element-pass-cmp').each(el => {
                el.src = `${el.src}?CMP=${allvars.CMP}`;
            });
        }
    },

    initRightHandComponent() {
        const mainColumn = qwery('.js-content-main-column');
        // only render when we have >1000px or more (enough space for ad + most popular)
        if (
            !config.hasTone('Match reports') &&
            mainColumn[0] &&
            mainColumn[0].offsetHeight > 1150 &&
            isBreakpoint({
                min: 'desktop',
            })
        ) {
            geoMostPopular.render();
        } else {
            mediator.emit('modules:onward:geo-most-popular:cancel');
        }
    },

    initQuizListeners() {
        // This event is for older-style quizzes implemented as interactives. See https://github.com/guardian/quiz-builder
        mediator.on('quiz/ophan-event', ophan.record);
    },

    initPaymentRequestButton() {
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
                prButton.mount('#payment-request-button');
            } else {
                const button = document.getElementById('payment-request-button');
                if (button instanceof HTMLElement) {
                    button.innerHTML = 'Payment Request API not available!!!';
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
                    alert('Successfully contributed £1!');
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
    },

    emitReadyEvent() {
        mediator.emit('page:article:ready');
    },
};

const init = () => {
    catchErrorsWithContext([
        ['article-trails', initTrails],
        ['article-liveblog-common', initLiveblogCommon],
        ['article-righthand-component', modules.initRightHandComponent],
        ['article-cmp-param', modules.initCmpParam],
        ['article-quiz-listeners', modules.initQuizListeners],
        ['article-rich-links', upgradeRichLinks],
        ['article-tag-rich-link', insertTagRichLink],
        ['article-upgrade-membership-events', upgradeMembershipEvents],
        ['article-mediator-emit-event', modules.emitReadyEvent],
        ['article-handle-quiz-completion', handleQuizCompletion],
        ['article-opt-in-engagement-banner', optInEngagementBannerInit],
        // ['article-payment-request-button', modules.initPaymentRequestButton],
    ]);
};

export { init };
