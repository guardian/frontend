// @flow
import $ from 'lib/$';
import fetch from 'lib/fetch';
import config from 'lib/config';
import reportError from 'lib/report-error';
import { formatDate, formatAmount } from 'membership/formatters';
import { display } from 'membership/stripe';

const PACKAGE_COST = '.js-dig-package-cost';
const PAYMENT_FORM = '.js-dig-card-details';
const SUBSCRIBER_ID = '.js-dig-subscriber-id';
const REMAINING_TRIAL_LENGTH = '.js-dig-remaining-trial-length';
const REMAINING_TRIAL_LENGTH_CONTAINER =
    '.js-dig-remaining-trial-length-container';
const PACKAGE_CURRENT_RENEWAL_DATE = '.js-dig-current-renewal-date';
const PACKAGE_CURRENT_PERIOD_END = '.js-dig-current-period-end';
const PACKAGE_CURRENT_PERIOD_START = '.js-dig-current-period-start';
const PACKAGE_NEXT_PAYMENT_DATE = '.js-dig-next-payment-date';
const PACKAGE_NEXT_PAYMENT_PRICE = '.js-dig-next-payment-price';
const PACKAGE_NEXT_PAYMENT_CONTAINER = '.js-dig-next-payment-container';
const PACKAGE_INTERVAL = '.js-dig-plan-interval';
const DETAILS_JOIN_DATE = '.js-dig-join-date';
const NOTIFICATION_CANCEL = '.js-dig-cancel-tier';
const DIGITALPACK_DETAILS = '.js-dig-details';
const DIGITALPACK_PRODUCT = '.js-dig-product';
const UP_SELL = '.js-dig-up-sell';
const DIG_INFO = '.js-dig-info';
const LOADER = '.js-dig-loader';
const IS_HIDDEN_CLASSNAME = 'is-hidden';
const ERROR = '.js-dig-error';
const WARNING = '.js-dig-warning';
const WARNING_TEXT = '.js-dig-warning-text';

const hideLoader = (): void => {
    $(LOADER).addClass(IS_HIDDEN_CLASSNAME);
};

const showWarning = (message: string): void => {
    $(WARNING_TEXT).text(message);
    $(WARNING).removeClass(IS_HIDDEN_CLASSNAME);
};

const populateUserDetails = (userDetails: UserDetails): void => {
    if (userDetails.alertText) {
        showWarning(userDetails.alertText);
    }
    const glyph = userDetails.subscription.plan.currency;
    $(SUBSCRIBER_ID).text(userDetails.subscription.subscriberId);
    $(DIGITALPACK_PRODUCT).text(userDetails.subscription.plan.name);
    $(PACKAGE_COST).text(
        formatAmount(userDetails.subscription.plan.amount, glyph)
    );
    $(DETAILS_JOIN_DATE).text(formatDate(userDetails.joinDate));
    $(PACKAGE_INTERVAL).text(`${userDetails.subscription.plan.interval}ly`);
    $(PACKAGE_CURRENT_PERIOD_START).text(
        formatDate(userDetails.subscription.start)
    );
    $(PACKAGE_CURRENT_PERIOD_END).text(
        formatDate(userDetails.subscription.end)
    );
    $(PACKAGE_CURRENT_RENEWAL_DATE).text(
        formatDate(userDetails.subscription.renewalDate)
    );
    const trialLeft = userDetails.subscription.trialLength;
    if (trialLeft > 0) {
        $(REMAINING_TRIAL_LENGTH).text(
            `${trialLeft} day${trialLeft !== 1 ? 's' : ''}`
        );
        $(REMAINING_TRIAL_LENGTH_CONTAINER).removeClass(IS_HIDDEN_CLASSNAME);
    }

    $(PACKAGE_NEXT_PAYMENT_DATE).text(
        formatDate(userDetails.subscription.nextPaymentDate)
    );
    if (
        userDetails.subscription.nextPaymentPrice !==
        userDetails.subscription.plan.amount
    ) {
        $(PACKAGE_NEXT_PAYMENT_PRICE).text(
            formatAmount(userDetails.subscription.nextPaymentPrice, glyph)
        );
        $(PACKAGE_NEXT_PAYMENT_CONTAINER).removeClass(IS_HIDDEN_CLASSNAME);
    }

    if (!userDetails.optIn) {
        $(NOTIFICATION_CANCEL).removeClass(IS_HIDDEN_CLASSNAME);
        $(DIGITALPACK_DETAILS).addClass(IS_HIDDEN_CLASSNAME);
    } else if (userDetails.subscription.card) {
        display(
            PAYMENT_FORM,
            userDetails.subscription.card,
            userDetails.subscription.card.stripePublicKeyForUpdate
        );
    }
    $(DIG_INFO).removeClass(IS_HIDDEN_CLASSNAME);
};

const displayDigitalPackUpSell = (): void => {
    $(UP_SELL).removeClass(IS_HIDDEN_CLASSNAME);
};

const displayErrorMessage = (): void => {
    $(ERROR).removeClass(IS_HIDDEN_CLASSNAME);
};

export const digitalpackTab = (): void => {
    fetch(`${config.get('page.userAttributesApiUrl')}/me/mma-digitalpack`, {
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
                displayDigitalPackUpSell();
            }
        })
        .catch(err => {
            hideLoader();
            displayErrorMessage();
            reportError(err, {
                feature: 'mma-digipack',
            });
        });
};
