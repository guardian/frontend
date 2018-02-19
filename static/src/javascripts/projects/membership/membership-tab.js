// @flow
import bean from 'bean';
import $ from 'lib/$';
import fetch from 'lib/fetch';
import config from 'lib/config';
import reportError from 'lib/report-error';
import { formatDate, formatAmount } from 'membership/formatters';
import { display } from 'membership/stripe';

const CARD_DETAILS = '.js-mem-card-details';
const PAYPAL = '.js-mem-paypal';
const CHANGE_TIER_CARD_LAST4 = '.js-mem-card-last4';
const PAYPAL_EMAIL_ADDRESS = '.js-paypal-email';
const PAYPAL_SHOW_EMAIL_BUTTON = '.js-show-paypal-button';
const PAYPAL_HIDE_EMAIL_BUTTON = '.js-hide-paypal-button';
const PAYPAL_SHOW_EMAIL_MESSAGE = '.js-paypal-email-message';
const PACKAGE_COST = '.js-mem-package-cost';
const PACKAGE_CURRENT_RENEWAL_DATE = '.js-mem-current-renewal-date';
const PACKAGE_CURRENT_PERIOD_END = '.js-mem-current-period-end';
const PACKAGE_CURRENT_PERIOD_START = '.js-mem-current-period-start';
const PACKAGE_CURRENT_PERIOD_START_CONTAINER =
    '.js-mem-current-period-start-container';
const PACKAGE_NEXT_PAYMENT_CONTAINER = '.js-mem-next-payment-container';
const TRIAL_INFO_CONTAINER = '.js-mem-only-for-trials';
const PACKAGE_NEXT_PAYMENT_DATE = '.js-mem-next-payment-date';
const PACKAGE_NEXT_PAYMENT_PRICE = '.js-mem-next-payment-price';
const PACKAGE_INTERVAL = '.js-mem-plan-interval';
const DETAILS_MEMBERSHIP_TIER_ICON_CURRENT = '.js-mem-icon-current';
const DETAILS_JOIN_DATE = '.js-mem-join-date';
const DETAILS_MEMBER_NUM_TEXT = '.js-mem-number';
const NOTIFICATION_CANCEL = '.js-mem-cancel-tier';
const NOTIFICATION_CHANGE = '.js-mem-change-tier';
const MEMBER_DETAILS = '.js-mem-details';
const DETAILS_MEMBER_NUMBER_CONTAINER = '.js-mem-number-container';
const MEMBERSHIP_TIER = '.js-mem-tier';
const UP_SELL = '.js-mem-up-sell';
const MEMBER_INFO = '.js-mem-info';
const LOADER = '.js-mem-loader';
const IS_HIDDEN_CLASSNAME = 'is-hidden';
const ERROR = '.js-mem-error';
const WARNING = '.js-mem-warning';
const WARNING_TEXT = '.js-mem-warning-text';

const showWarning = (message: string): void => {
    $(WARNING_TEXT).text(message);
    $(WARNING).removeClass(IS_HIDDEN_CLASSNAME);
};

const hideLoader = (): void => {
    $(LOADER).addClass(IS_HIDDEN_CLASSNAME);
};

const hidePayPalAccountName = (): void => {
    $(PAYPAL_SHOW_EMAIL_MESSAGE).addClass(IS_HIDDEN_CLASSNAME);
    $(PAYPAL_SHOW_EMAIL_BUTTON).removeClass(IS_HIDDEN_CLASSNAME);
    $(PAYPAL_HIDE_EMAIL_BUTTON).addClass(IS_HIDDEN_CLASSNAME);
};

const showPayPalAccountName = (): void => {
    $(PAYPAL_SHOW_EMAIL_MESSAGE).removeClass(IS_HIDDEN_CLASSNAME);
    $(PAYPAL_HIDE_EMAIL_BUTTON).removeClass(IS_HIDDEN_CLASSNAME);
    $(PAYPAL_SHOW_EMAIL_BUTTON).addClass(IS_HIDDEN_CLASSNAME);
};

const displayMembershipUpSell = (): void => {
    $(UP_SELL).removeClass(IS_HIDDEN_CLASSNAME);
};

const displayErrorMessage = (): void => {
    $(ERROR).removeClass(IS_HIDDEN_CLASSNAME);
};

const populateUserDetails = (userDetails: UserDetails): void => {
    const isMonthly = userDetails.subscription.plan.interval === 'month';
    const intervalText = isMonthly ? 'Monthly' : 'Annual';
    const glyph = userDetails.subscription.plan.currency;
    let notificationTypeSelector;

    if (userDetails.alertText != null || userDetails.alertText !== '') {
        showWarning(userDetails.alertText);
    }

    $(MEMBERSHIP_TIER).text(userDetails.tier);
    $(PACKAGE_COST).text(
        formatAmount(userDetails.subscription.plan.amount, glyph)
    );
    $(DETAILS_JOIN_DATE).text(formatDate(userDetails.joinDate));
    $(PACKAGE_INTERVAL).text(intervalText);

    const exists =
        userDetails.subscription.card && userDetails.subscription.card.last4;
    if (exists) {
        $(CHANGE_TIER_CARD_LAST4).text(exists);
    } else if (userDetails.subscription.payPalEmail) {
        $(PAYPAL_EMAIL_ADDRESS).text(userDetails.subscription.payPalEmail);
    }

    $(PACKAGE_CURRENT_PERIOD_END).text(
        formatDate(userDetails.subscription.end)
    );
    $(PACKAGE_CURRENT_RENEWAL_DATE).text(
        formatDate(userDetails.subscription.renewalDate)
    );

    if (userDetails.subscription.nextPaymentDate) {
        $(PACKAGE_NEXT_PAYMENT_DATE).text(
            formatDate(userDetails.subscription.nextPaymentDate)
        );
        $(PACKAGE_NEXT_PAYMENT_CONTAINER).removeClass(IS_HIDDEN_CLASSNAME);
    }

    $(PACKAGE_NEXT_PAYMENT_PRICE).text(
        formatAmount(userDetails.subscription.nextPaymentPrice, glyph)
    );

    if (userDetails.subscription.trialLength > 0) {
        $(TRIAL_INFO_CONTAINER).removeClass(IS_HIDDEN_CLASSNAME);
    }

    // display membership number
    if (userDetails.regNumber) {
        $(DETAILS_MEMBER_NUMBER_CONTAINER).removeClass(IS_HIDDEN_CLASSNAME);
        $(DETAILS_MEMBER_NUM_TEXT).text(userDetails.regNumber);
    }

    if (userDetails.subscription.start) {
        $(PACKAGE_CURRENT_PERIOD_START).text(
            formatDate(userDetails.subscription.start)
        );
        $(PACKAGE_CURRENT_PERIOD_START_CONTAINER).removeClass(
            IS_HIDDEN_CLASSNAME
        );
    }

    // user has cancelled
    if (userDetails.subscription.cancelledAt) {
        // is this a tier change or a cancellation
        notificationTypeSelector = userDetails.optIn
            ? NOTIFICATION_CHANGE
            : NOTIFICATION_CANCEL;
        $(notificationTypeSelector).removeClass(IS_HIDDEN_CLASSNAME);
        $(MEMBER_DETAILS).addClass(IS_HIDDEN_CLASSNAME);
        $(DETAILS_MEMBERSHIP_TIER_ICON_CURRENT).addClass(
            `i-g-${userDetails.tier.toLowerCase()}`
        );
    } else if (userDetails.subscription.card) {
        // only show card details if user hasn't changed their subscription and has stripe as payment method
        display(
            CARD_DETAILS,
            userDetails.subscription.card,
            userDetails.subscription.card.stripePublicKeyForUpdate
        );
    } else if (userDetails.subscription.payPalEmail) {
        // if the user hasn't changed their subscription and has PayPal as a payment method
        $(PAYPAL).removeClass(IS_HIDDEN_CLASSNAME);
        bean.on($(PAYPAL_SHOW_EMAIL_BUTTON)[0], 'click', showPayPalAccountName);
        bean.on($(PAYPAL_HIDE_EMAIL_BUTTON)[0], 'click', hidePayPalAccountName);
    }

    $(MEMBER_INFO).removeClass(IS_HIDDEN_CLASSNAME);
};
export const membershipTab = (): void => {
    fetch(`${config.get('page.userAttributesApiUrl')}/me/mma-membership`, {
        mode: 'cors',
        credentials: 'include',
    })
        .then(resp => resp.json())
        .then(json => {
            if (json && json.subscription) {
                hideLoader();
                populateUserDetails(json);
            } else {
                hideLoader();
                displayMembershipUpSell();
            }
        })
        .catch(err => {
            hideLoader();
            displayErrorMessage();
            reportError(err, {
                feature: 'mma-membership',
            });
        });
};
