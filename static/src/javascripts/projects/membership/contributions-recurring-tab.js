// @flow
import $ from 'lib/$';
import fetch from 'lib/fetch';
import config from 'lib/config';
import reportError from 'lib/report-error';
import { formatDate, formatAmount } from 'membership/formatters';
import { display } from 'membership/stripe';

const CARD_DETAILS = '.js-contribution-card-details';
const PAYPAL = '.js-contribution-paypal';
const MANAGE_CARD_LAST4 = '.js-manage-account-card-last4';
const PAYPAL_SHOW_EMAIL_BUTTON = '.js-show-paypal-button';
const CONTRIBUTION_PERIOD_START_CONTAINER =
    '.js-contribution-period-start-container';
const CONTRIBUTION_PERIOD_START = '.js-contribution-period-start';
const PACKAGE_NEXT_PAYMENT_DATE = '.js-contribution-next-payment-date';
const PACKAGE_NEXT_PAYMENT_PRICE = '.js-contribution-next-payment-price';
const PACKAGE_INTERVAL = '.js-contribution-plan-interval';
const NOTIFICATION_CANCEL = '.js-contribution-cancel';
const NOTIFICATION_CHANGE = '.js-contribution-change';
const UP_SELL = '.js-contribution-up-sell';
const CONTRIBUTION_INFO = '.js-contribution-info';
const LOADER = '.js-contribution-loader';
const IS_HIDDEN_CLASSNAME = 'is-hidden';
const ERROR = '.js-contribution-error';
const CANCEL_CONTRIBUTION = '.js-contribution-cancel';
const CANCEL_CONTRIBUTION_SECTION = '.js-contribution-cancellation__section';
const CANCEL_CONTRIBUTION_SUBMIT = '.js-cancel-contribution-submit';
const CANCEL_CONTRIBUTION_KEEP_CONTRIBUTING='.js-cancel-contribution-keep-contributing';
const CANCEL_CONTRIBUTION_SELECTOR = '.js-cancel-contribution-selector';
const CANCEL_CONTRIBUTION_MSG_SUCCESS = 'js-cancel-contribution-msg-success';

const hideLoader = (): void => {
    $(LOADER).addClass(IS_HIDDEN_CLASSNAME);
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

const displayCancelContribution = (): void => {
    $(CANCEL_CONTRIBUTION).removeClass(IS_HIDDEN_CLASSNAME);
};

const hideCancelContribution = (): void => {
    $(CANCEL_CONTRIBUTION).addClass(IS_HIDDEN_CLASSNAME);
};

const hideContributionInfo = (): void => {
    $(CONTRIBUTION_INFO).addClass(IS_HIDDEN_CLASSNAME);
};

const displayContributionSuccessMsg = (): void => {
    $(CANCEL_CONTRIBUTION_SECTION).removeClass(IS_HIDDEN_CLASSNAME);
};

const hideContributionSuccessMsg = (): void => {
    $(CANCEL_CONTRIBUTION_SECTION).addClass(IS_HIDDEN_CLASSNAME);
};

const displayContributionSuccessMsg = (): void => {
    $(CANCEL_CONTRIBUTION_MSG_SUCCESS).removeClass(IS_HIDDEN_CLASSNAME);
};

const hideContributionSuccessMsg = (): void => {
    $(CANCEL_CONTRIBUTION_MSG_SUCCESS).addClass(IS_HIDDEN_CLASSNAME);
};

const cancelContribution = (): void => {
    fetch(
        `${config.get(
            'page.userAttributesApiUrl'
        )}/me/cancel-regular-contribution`,
        {
            method: 'post',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Csrf-Token': 'nocheck',
            },
            body: {
                reason: 'Customer',
            },
        }
    ).catch(err => {
        hideLoader();
        displayErrorMessage();
        reportError(err, {
            feature: 'mma-monthlycontribution',
        });
    });
};

const populateUserDetails = (contributorDetails: ContributorDetails): void => {
    const isMonthly = contributorDetails.subscription.plan.interval === 'month';
    const intervalText = isMonthly ? 'Monthly' : 'Annual';
    const glyph = contributorDetails.subscription.plan.currency;
    let notificationTypeSelector;

    $(PACKAGE_INTERVAL).text(intervalText);

    const cardTail =
        contributorDetails.subscription.card &&
        contributorDetails.subscription.card.last4;
    if (cardTail) {
        $(MANAGE_CARD_LAST4).text(cardTail);
    }

    if (contributorDetails.subscription.nextPaymentDate) {
        $(PACKAGE_NEXT_PAYMENT_DATE).text(
            formatDate(contributorDetails.subscription.nextPaymentDate)
        );
    }

    $(PACKAGE_NEXT_PAYMENT_PRICE).text(
        formatAmount(contributorDetails.subscription.plan.amount, glyph)
    );

    if (contributorDetails.subscription.start) {
        $(CONTRIBUTION_PERIOD_START).text(
            formatDate(contributorDetails.subscription.start)
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
    } else if (contributorDetails.subscription.card) {
        display(
            CARD_DETAILS,
            contributorDetails.subscription.card,
            contributorDetails.subscription.card.stripePublicKeyForUpdate
        );
    } else if (contributorDetails.subscription.payPalEmail) {
        // if the user hasn't changed their subscription and has PayPal as a payment method
        $(PAYPAL_SHOW_EMAIL_BUTTON).addClass(IS_HIDDEN_CLASSNAME);
        $(PAYPAL).removeClass(IS_HIDDEN_CLASSNAME);
    }

    if (!contributorDetails.subscription.cancelledAt) {
        displayCancelContribution();

        const cancelButton = document.querySelector(CANCEL_CONTRIBUTION_BUTTON);
        const cancelSelector = document.querySelector(CANCEL_CONTRIBUTION_SELECTOR);

        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                cancelContribution();
            });
        }
    } else {
        hideCancelContribution();
        displaySupportUpSell();
        hideContributionInfo();
    }
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
                populateUserDetails(json);
                hideLoader();
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
