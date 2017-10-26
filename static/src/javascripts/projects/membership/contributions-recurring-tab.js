// @flow
import bean from 'bean';
import $ from 'lib/$';
import fetch from 'lib/fetch';
import config from 'lib/config';
import reportError from 'lib/report-error';
import formatters from 'membership/formatters';
import { display } from 'membership/stripe';

const CARD_DETAILS = '.js-contribution-card-details';
const PAYPAL = '.js-contribution-paypal';
const MANAGE_CARD_LAST4 = '.js-manage-account-card-last4';
const PAYPAL_EMAIL_ADDRESS = '.js-paypal-email';
const PAYPAL_SHOW_EMAIL_BUTTON = '.js-show-paypal-button';
const PAYPAL_HIDE_EMAIL_BUTTON = '.js-hide-paypal-button';
const PAYPAL_SHOW_EMAIL_MESSAGE = '.js-paypal-email-message';
// const PACKAGE_COST = '.js-mem-package-cost';
// const PACKAGE_CURRENT_RENEWAL_DATE = '.js-mem-current-renewal-date';
// const PACKAGE_CURRENT_PERIOD_END = '.js-mem-current-period-end';
const CONTRIBUTION_PERIOD_START_CONTAINER =
    '.js-contribution-period-start-container';
const CONTRIBUTION_PERIOD_START = '.js-contribution-period-start';
// const PACKAGE_NEXT_PAYMENT_CONTAINER =
//     '.js-contribution-next-payment-container';
// const TRIAL_INFO_CONTAINER = '.js-mem-only-for-trials';
const PACKAGE_NEXT_PAYMENT_DATE = '.js-contribution-next-payment-date';
const PACKAGE_NEXT_PAYMENT_PRICE = '.js-contribution-next-payment-price';
const PACKAGE_INTERVAL = '.js-contribution-plan-interval';
// const DETAILS_CONTRIBUTION_ICON_CURRENT = '.js-contribution-icon-current';
// const DETAILS_JOIN_DATE = '.js-mem-join-date';
const NOTIFICATION_CANCEL = '.js-contribution-cancel';
const NOTIFICATION_CHANGE = '.js-contribution-change';
// const MEMBER_DETAILS = '.js-mem-details';
const DETAILS_SUBSCRIPTION_NUMBER_CONTAINER =
    '.js-contribution-subscription-number-container';
const DETAILS_SUBSCRIPTION_NUM_TEXT = '.js-contribution-subscription-number';
// const MEMBERSHIP_TIER = '.js-mem-tier';
const UP_SELL = '.js-contribution-up-sell';
const CONTRIBUTION_INFO = '.js-contribution-info';
const LOADER = '.js-contribution-loader';
const IS_HIDDEN_CLASSNAME = 'is-hidden';
const ERROR = '.js-contribution-error';

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

const displayContributionInfo = (): void => {
    $(CONTRIBUTION_INFO).removeClass(IS_HIDDEN_CLASSNAME);
};

const displaySupportUpSell = (): void => {
    $(UP_SELL).removeClass(IS_HIDDEN_CLASSNAME);
};

const displayErrorMessage = (): void => {
    $(ERROR).removeClass(IS_HIDDEN_CLASSNAME);
};

const populateUserDetails = (contributorDetails: ContributorDetails): void => {
    const isMonthly = contributorDetails.subscription.plan.interval === 'month';
    const intervalText = isMonthly ? 'Monthly' : 'Annual';
    const glyph = contributorDetails.subscription.plan.currency;
    let notificationTypeSelector;

    // $(MEMBERSHIP_TIER).text(contributorDetails.tier);
    // $(PACKAGE_COST).text(
    //     formatters.formatAmount(contributorDetails.subscription.plan.amount, glyph)
    // );
    // $(DETAILS_JOIN_DATE).text(formatters.formatDate(contributorDetails.joinDate));
    $(PACKAGE_INTERVAL).text(intervalText);

    const cardTail =
        contributorDetails.subscription.card &&
        contributorDetails.subscription.card.last4;
    if (cardTail) {
        $(MANAGE_CARD_LAST4).text(cardTail);
    } else if (contributorDetails.subscription.payPalEmail) {
        $(PAYPAL_EMAIL_ADDRESS).text(
            contributorDetails.subscription.payPalEmail
        );
    }

    // $(PACKAGE_CURRENT_PERIOD_END).text(
    //     formatters.formatDate(contributorDetails.subscription.end)
    // );
    // $(PACKAGE_CURRENT_RENEWAL_DATE).text(
    //     formatters.formatDate(contributorDetails.subscription.renewalDate)
    // );

    if (contributorDetails.subscription.nextPaymentDate) {
        $(PACKAGE_NEXT_PAYMENT_DATE).text(
            formatters.formatDate(
                contributorDetails.subscription.nextPaymentDate
            )
        );
        // $(PACKAGE_NEXT_PAYMENT_CONTAINER).removeClass(IS_HIDDEN_CLASSNAME);
    }

    $(PACKAGE_NEXT_PAYMENT_PRICE).text(
        formatters.formatAmount(
            contributorDetails.subscription.plan.amount,
            glyph
        )
    );

    // if (contributorDetails.subscription.trialLength > 0) {
    //     $(TRIAL_INFO_CONTAINER).removeClass(IS_HIDDEN_CLASSNAME);
    // }

    // display membership number
    if (contributorDetails.subscription.subscriberId) {
        $(DETAILS_SUBSCRIPTION_NUMBER_CONTAINER).removeClass(
            IS_HIDDEN_CLASSNAME
        );
        $(DETAILS_SUBSCRIPTION_NUM_TEXT).text(
            contributorDetails.subscription.subscriberId
        );
    }

    if (contributorDetails.subscription.start) {
        $(CONTRIBUTION_PERIOD_START).text(
            formatters.formatDate(contributorDetails.subscription.start)
        );
        $(CONTRIBUTION_PERIOD_START_CONTAINER).removeClass(IS_HIDDEN_CLASSNAME);
    }

    // user has cancelled
    if (contributorDetails.subscription.cancelledAt) {
        // is this a tier change or a cancellation
        notificationTypeSelector = contributorDetails.optIn
            ? NOTIFICATION_CHANGE
            : NOTIFICATION_CANCEL;
        $(notificationTypeSelector).removeClass(IS_HIDDEN_CLASSNAME);
        // $(MEMBER_DETAILS).addClass(IS_HIDDEN_CLASSNAME);
        // $(DETAILS_CONTRIBUTION_ICON_CURRENT).addClass(
        //     `i-g-${contributorDetails.tier.toLowerCase()}`
        // );
    } else if (contributorDetails.subscription.card) {
        display(
            CARD_DETAILS,
            contributorDetails.subscription.card,
            contributorDetails.subscription.card.stripePublicKeyForUpdate
        );
    } else if (contributorDetails.subscription.payPalEmail) {
        // if the user hasn't changed their subscription and has PayPal as a payment method
        $(PAYPAL).removeClass(IS_HIDDEN_CLASSNAME);
        bean.on($(PAYPAL_SHOW_EMAIL_BUTTON)[0], 'click', showPayPalAccountName);
        bean.on($(PAYPAL_HIDE_EMAIL_BUTTON)[0], 'click', hidePayPalAccountName);
    }

    // $(MEMBER_INFO).removeClass(IS_HIDDEN_CLASSNAME);
};
export const recurringContributionTab = (): void => {
    fetch(
        `${config.get('page.userAttributesApiUrl')}/me/mma-monthlycontribution`,
        {
            mode: 'cors',
            credentials: 'include',
        }
    )
        .then(resp => resp.json())
        .then(json => {
            if (json && json.subscription) {
                hideLoader();
                populateUserDetails(json);
                displayContributionInfo();
            } else {
                hideLoader();
                displaySupportUpSell();
            }
        })
        .catch(err => {
            hideLoader();
            displayErrorMessage();
            reportError(err, {
                feature: 'mma-monthlycontribution',
            });
        });
};
