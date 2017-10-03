import bean from 'bean';
import $ from 'lib/$';
import fetch from 'lib/fetch';
import config from 'lib/config';
import reportError from 'lib/report-error';
import formatters from 'membership/formatters';
import stripe from 'membership/stripe';

const PACKAGE_COST = '.js-dig-package-cost', PAYMENT_FORM = '.js-dig-card-details', SUBSCRIBER_ID = '.js-dig-subscriber-id', REMAINING_TRIAL_LENGTH = '.js-dig-remaining-trial-length', REMAINING_TRIAL_LENGTH_CONTAINER = '.js-dig-remaining-trial-length-container', PACKAGE_CURRENT_RENEWAL_DATE = '.js-dig-current-renewal-date', PACKAGE_CURRENT_PERIOD_END = '.js-dig-current-period-end', PACKAGE_CURRENT_PERIOD_START = '.js-dig-current-period-start', PACKAGE_NEXT_PAYMENT_DATE = '.js-dig-next-payment-date', PACKAGE_NEXT_PAYMENT_PRICE = '.js-dig-next-payment-price', PACKAGE_NEXT_PAYMENT_CONTAINER = '.js-dig-next-payment-container', PACKAGE_INTERVAL = '.js-dig-plan-interval', DETAILS_JOIN_DATE = '.js-dig-join-date', NOTIFICATION_CANCEL = '.js-dig-cancel-tier', DIGITALPACK_DETAILS = '.js-dig-details', DIGITALPACK_PRODUCT = '.js-dig-product', UP_SELL = '.js-dig-up-sell', DIG_INFO = '.js-dig-info', LOADER = '.js-dig-loader', IS_HIDDEN_CLASSNAME = 'is-hidden', ERROR = '.js-dig-error';

function fetchUserDetails() {
    fetch(config.page.userAttributesApiUrl + '/me/mma-digitalpack', {
        mode: 'cors',
        credentials: 'include',
    }).then(resp => resp.json()).then(json => {
        if (json && json.subscription) {
            hideLoader();
            populateUserDetails(json);
        } else {
            hideLoader();
            displayDigitalPackUpSell();
        }
    }).catch(err => {
        hideLoader();
        displayErrorMessage();
        reportError(err, {
            feature: 'mma-digipack'
        })
    });
}

function hideLoader() {
    $(LOADER).addClass(IS_HIDDEN_CLASSNAME);
}

/**
 * @param {{
 *  optIn,
 *  joinDate,subscriberId,
 *  subscription: {trialLength, nextPaymentDate,nextPaymentPrice,renewalDate,
 *  plan: {name,amount,interval}}
 * }} userDetails
 */
function populateUserDetails(userDetails) {
    const glyph = userDetails.subscription.plan.currency;
    $(SUBSCRIBER_ID).text(userDetails.subscription.subscriberId);
    $(DIGITALPACK_PRODUCT).text(userDetails.subscription.plan.name);
    $(PACKAGE_COST).text(formatters.formatAmount(userDetails.subscription.plan.amount, glyph));
    $(DETAILS_JOIN_DATE).text(formatters.formatDate(userDetails.joinDate));
    $(PACKAGE_INTERVAL).text(userDetails.subscription.plan.interval + 'ly');
    $(PACKAGE_CURRENT_PERIOD_START).text(formatters.formatDate(userDetails.subscription.start));
    $(PACKAGE_CURRENT_PERIOD_END).text(formatters.formatDate(userDetails.subscription.end));
    $(PACKAGE_CURRENT_RENEWAL_DATE).text(formatters.formatDate(userDetails.subscription.renewalDate));
    const trialLeft = userDetails.subscription.trialLength;
    if (trialLeft > 0) {
        $(REMAINING_TRIAL_LENGTH).text(trialLeft + ' day' + (trialLeft != 1 ? 's' : ''));
        $(REMAINING_TRIAL_LENGTH_CONTAINER).removeClass(IS_HIDDEN_CLASSNAME);
    }

    $(PACKAGE_NEXT_PAYMENT_DATE).text(formatters.formatDate(userDetails.subscription.nextPaymentDate));
    if (userDetails.subscription.nextPaymentPrice != userDetails.subscription.plan.amount) {
        $(PACKAGE_NEXT_PAYMENT_PRICE).text(formatters.formatAmount(userDetails.subscription.nextPaymentPrice, glyph));
        $(PACKAGE_NEXT_PAYMENT_CONTAINER).removeClass(IS_HIDDEN_CLASSNAME);
    }

    if (!userDetails.optIn) {
        $(NOTIFICATION_CANCEL).removeClass(IS_HIDDEN_CLASSNAME);
        $(DIGITALPACK_DETAILS).addClass(IS_HIDDEN_CLASSNAME);
    } else if (userDetails.subscription.card) {
        stripe.display(PAYMENT_FORM, userDetails.subscription.card, userDetails.subscription.card.stripePublicKeyForUpdate);
    }
    $(DIG_INFO).removeClass(IS_HIDDEN_CLASSNAME);
}

function displayDigitalPackUpSell() {
    $(UP_SELL).removeClass(IS_HIDDEN_CLASSNAME);
}

function displayErrorMessage() {
    $(ERROR).removeClass(IS_HIDDEN_CLASSNAME);
}


export default {
    init: fetchUserDetails
};
