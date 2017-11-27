// @flow
import $ from 'lib/$';
import fetch from 'lib/fetch';
import config from 'lib/config';
import reportError from 'lib/report-error';
import { formatDate, formatAmount } from 'membership/formatters';
import { display } from 'membership/stripe';
import fastdom from 'fastdom';

const CARD_DETAILS = '.js-contribution-card-details';
const PAYPAL = '.js-contribution-paypal';
const MANAGE_CARD_LAST4 = '.js-manage-account-card-last4';
const PAYPAL_SHOW_EMAIL_BUTTON = '.js-show-paypal-button';
const CONTRIBUTION_PERIOD_START_CONTAINER =
    '.js-contribution-period-start-container';
const CONTRIBUTION_PERIOD_START = '.js-contribution-period-start';
const PACKAGE_NEXT_PAYMENT_CONTAINER =
    '.js-contribution-next-payment-container';
const PACKAGE_NEXT_PAYMENT_FORM_CONTAINER =
    '.js-contribution-next-payment-form-container';
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
const CANCEL_CONTRIBUTION_BUTTON = '.js-manage-account-cancel-contribution';
const CHANGE_CONTRIBUTION_AMOUNT = '.js-contribution-change-amount';
const CONTRIBUTION_NEW_AMOUNT_FIELD = '.js-contribution-next-payment-new-price';
const CHANGE_CONTRIBUTION_AMOUNT_BUTTON =
    '.js-manage-account-change-contribution-amount';
const CHANGE_CONTRIBUTION_AMOUNT_CANCEL =
    '.js-manage-account-change-contribution-amount-cancel';
const CHANGE_CONTRIBUTION_AMOUNT_SUBMIT =
    '.js-manage-account-change-contribution-amount-confirm';

const displayLoader = (): void => {
    $(LOADER).removeClass(IS_HIDDEN_CLASSNAME);
};

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

const displayChangeContributionAmount = (): void => {
    $(CHANGE_CONTRIBUTION_AMOUNT).removeClass(IS_HIDDEN_CLASSNAME);
};

// const hideChangeContributionAmount = (): void => {
//     $(CHANGE_CONTRIBUTION_AMOUNT).addClass(IS_HIDDEN_CLASSNAME);
// };

const hideContributionInfo = (): void => {
    $(CONTRIBUTION_INFO).addClass(IS_HIDDEN_CLASSNAME);
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

const displayChangeContributionForm = (currentPrice: string): void => {
    fastdom.write(() => {
        $(PACKAGE_NEXT_PAYMENT_CONTAINER).addClass(IS_HIDDEN_CLASSNAME);
        $(PACKAGE_NEXT_PAYMENT_FORM_CONTAINER).removeClass(IS_HIDDEN_CLASSNAME);
        $(CONTRIBUTION_NEW_AMOUNT_FIELD).val(currentPrice);
    });
};

const hideChangeContributionForm = (): void => {
    $(PACKAGE_NEXT_PAYMENT_FORM_CONTAINER).addClass(IS_HIDDEN_CLASSNAME);
    $(PACKAGE_NEXT_PAYMENT_CONTAINER).removeClass(IS_HIDDEN_CLASSNAME);
};

const changeContributionAmountSubmit = (): void => {
    const newAmount = $(CONTRIBUTION_NEW_AMOUNT_FIELD).val();
    displayLoader();
    fetch(
        `${config.get(
            'page.userAttributesApiUrl'
        )}/me/contribution-update-amount`,
        {
            mode: 'cors',
            credentials: 'include',
            method: 'post',
            headers: {
                'Csrf-Token': 'nocheck',
            },
            body: {
                newPaymentAmount: `${newAmount}`,
            },
        }
    ).catch(err => {
        hideLoader();
        displayErrorMessage();
        reportError(err, {
            feature: 'mma-monthlycontribution',
        });
    });
    hideLoader();
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

    displayChangeContributionAmount();
    const changeAmountButton = document.querySelector(
        CHANGE_CONTRIBUTION_AMOUNT_BUTTON
    );
    if (changeAmountButton) {
        changeAmountButton.addEventListener('click', () => {
            displayChangeContributionForm(
                formatAmount(
                    contributorDetails.subscription.plan.amount,
                    ''
                ).toString()
            );
        });
    }

    const changeAmountCancelButton = document.querySelector(
        CHANGE_CONTRIBUTION_AMOUNT_CANCEL
    );
    if (changeAmountCancelButton) {
        changeAmountCancelButton.addEventListener('click', () => {
            hideChangeContributionForm();
        });
    }

    const changeAmountConfirmButton = document.querySelector(
        CHANGE_CONTRIBUTION_AMOUNT_SUBMIT
    );
    if (changeAmountConfirmButton) {
        changeAmountConfirmButton.addEventListener('click', () => {
            changeContributionAmountSubmit();
        });
    }

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
