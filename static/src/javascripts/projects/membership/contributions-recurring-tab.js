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
const PACKAGE_NEXT_PAYMENT_AMOUNT_CONTAINER =
    '.js-contribution-next-payment-amount-container';
const PACKAGE_NEXT_PAYMENT_DATE_CONTAINER =
    '.js-contribution-next-payment-date-container';
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
const IS_DISABLED_CLASSNAME = 'is-disabled';
const ERROR = '.js-contribution-error';

const CANCEL_CONTRIBUTION = '.js-contribution-cancel';
const CANCEL_CONTRIBUTION_FORM = '.js-cancellation-form';
const CANCEL_CONTRIBUTION_MSG_SUCCESS = '.js-cancel-contribution-msg-success';
const CANCEL_CONTRIBUTION_LINK = '.js-cancel-contribution-link';
const KEEP_CONTRIBUTION_LINK = '.js-cancel-contribution-keep-contributing';
const CANCEL_CONTRIBUTION_SELECTOR = '.js-cancel-contribution-selector';
const CANCEL_CONTRIBUTION_SUBMIT = '.js-cancel-contribution-submit';

const CURRENT_CONTRIBUTION_AMOUNT = '.js-current-contribution-amount';
const CONTRIBUTION_GLYPH = '.js-contribution-glyph';
const CHANGE_CONTRIBUTION_AMOUNT = '.js-contribution-change-amount';
const CONTRIBUTION_NEW_AMOUNT_FIELD = '.js-contribution-next-payment-new-price';
const CHANGE_CONTRIBUTION_AMOUNT_BUTTON =
    '.js-manage-account-change-contribution-amount';
const CHANGE_CONTRIBUTION_AMOUNT_CANCEL =
    '.js-manage-account-change-contribution-amount-cancel';
const CHANGE_CONTRIBUTION_AMOUNT_SUBMIT =
    '.js-manage-account-change-contribution-amount-confirm';
const CONTRIBUTION_TOO_LOW_WARNING =
    '.js-manage-account-change-contribution-amount-too-low';
const CONTRIBUTION_TOO_HIGH_WARNING =
    '.js-manage-account-change-contribution-amount-too-high';
const CONTRIBUTION_NO_CHANGE_WARNING =
    '.js-manage-account-change-contribution-amount-unchanged';

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

const hideContributionInfo = (): void => {
    $(CONTRIBUTION_INFO).addClass(IS_HIDDEN_CLASSNAME);
};

// Cancel contribution aux functions

const displayCancelContribution = (): void => {
    $(CANCEL_CONTRIBUTION).removeClass(IS_HIDDEN_CLASSNAME);
};

const hideCancelContribution = (): void => {
    $(CANCEL_CONTRIBUTION).addClass(IS_HIDDEN_CLASSNAME);
};

const displayCancelContributionForm = (): void => {
    $(CANCEL_CONTRIBUTION_FORM).removeClass(IS_HIDDEN_CLASSNAME);
};

const displayChangeContributionAmount = (): void => {
    $(CHANGE_CONTRIBUTION_AMOUNT).removeClass(IS_HIDDEN_CLASSNAME);
};

// const hideChangeContributionAmount = (): void => {
//     $(CHANGE_CONTRIBUTION_AMOUNT).addClass(IS_HIDDEN_CLASSNAME);
// };

const hideCancelContributionForm = (): void => {
    $(CANCEL_CONTRIBUTION_FORM).addClass(IS_HIDDEN_CLASSNAME);
};

const hideCancelContributionSuccessMessage = (): void => {
    $(CANCEL_CONTRIBUTION_MSG_SUCCESS).addClass(IS_HIDDEN_CLASSNAME);
};

const displayCancelContributionLink = (): void => {
    $(CANCEL_CONTRIBUTION_LINK).removeClass(IS_HIDDEN_CLASSNAME);
};

const hideCancelContributionLink = (): void => {
    $(CANCEL_CONTRIBUTION_LINK).addClass(IS_HIDDEN_CLASSNAME);
};

const disableCancellationSubmit = (): void => {
    $(CANCEL_CONTRIBUTION_SUBMIT).addClass(IS_DISABLED_CLASSNAME);
    $(CANCEL_CONTRIBUTION_SUBMIT)[0].disabled = true;
};

const enableCancellationSubmit = (): void => {
    $(CANCEL_CONTRIBUTION_SUBMIT).removeClass(IS_DISABLED_CLASSNAME);
    $(CANCEL_CONTRIBUTION_SUBMIT)[0].disabled = false;
};

const handleCancelContributionSubmit = (): void => {
    const cancellationReasonSelector = document.querySelector(
        CANCEL_CONTRIBUTION_SELECTOR
    );

    if (
        !cancellationReasonSelector ||
        !(cancellationReasonSelector instanceof HTMLSelectElement)
    ) {
        return;
    }

    const cancellationReason = cancellationReasonSelector.value;

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
                reason: cancellationReason,
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

const handleCancellationReasonChange = (): void => {
    const cancelContributionSubmit = document.querySelector(
        CANCEL_CONTRIBUTION_SUBMIT
    );
    const cancellationReasonSelector = document.querySelector(
        CANCEL_CONTRIBUTION_SELECTOR
    );

    enableCancellationSubmit();

    if (
        cancellationReasonSelector &&
        cancellationReasonSelector instanceof HTMLSelectElement
    ) {
        cancellationReasonSelector.removeEventListener(
            'change',
            handleCancellationReasonChange
        );
    }

    if (cancelContributionSubmit) {
        cancelContributionSubmit.addEventListener(
            'click',
            handleCancelContributionSubmit
        );
    }
};

const resetSelector = (): void => {
    const cancellationReasonSelector = document.querySelector(
        CANCEL_CONTRIBUTION_SELECTOR
    );

    if (
        cancellationReasonSelector &&
        cancellationReasonSelector instanceof HTMLSelectElement
    ) {
        cancellationReasonSelector.value = '';
    }
};

const handleKeepContributingLink = (): void => {
    displayCancelContributionLink();
    hideCancelContributionForm();
    hideCancelContributionSuccessMessage();
    resetSelector();
};

const handleCancelLink = (): void => {
    hideCancelContributionLink();
    disableCancellationSubmit();
    displayCancelContributionForm();

    const keepContributingLink = document.querySelector(KEEP_CONTRIBUTION_LINK);
    const cancellationReasonSelector = document.querySelector(
        CANCEL_CONTRIBUTION_SELECTOR
    );

    if (keepContributingLink) {
        keepContributingLink.addEventListener(
            'click',
            handleKeepContributingLink
        );
    }

    if (cancellationReasonSelector) {
        cancellationReasonSelector.addEventListener(
            'change',
            handleCancellationReasonChange
        );
    }
};

const setupCancelContribution = (): void => {
    hideCancelContributionForm();
    hideCancelContributionSuccessMessage();
    displayCancelContributionLink();
    displayCancelContribution();

    const cancelLink = document.querySelector(CANCEL_CONTRIBUTION_LINK);

    if (cancelLink) {
        cancelLink.addEventListener('click', handleCancelLink);
    }
};

const handlePriceChange = (): void => {
    const currentPrice = $(CURRENT_CONTRIBUTION_AMOUNT).text();
    const submitButton = $(CHANGE_CONTRIBUTION_AMOUNT_SUBMIT);
    const fieldVal = $(CONTRIBUTION_NEW_AMOUNT_FIELD).val();
    if (fieldVal &&
        Number(fieldVal) &&
        Number(fieldVal) >= 5 &&
        Number(fieldVal) <= 2000 &&
        Number(fieldVal) !== Number(currentPrice)) {
        $(CONTRIBUTION_TOO_LOW_WARNING).addClass(IS_HIDDEN_CLASSNAME);
        $(CONTRIBUTION_TOO_HIGH_WARNING).addClass(IS_HIDDEN_CLASSNAME);
        submitButton.removeClass(IS_DISABLED_CLASSNAME);
    } else {
        submitButton.addClass(IS_DISABLED_CLASSNAME);
    }
};

const handlePriceChangeOnBlur = (): void => {
    const currentAmount = $(CURRENT_CONTRIBUTION_AMOUNT).text();
    const submitButton = $(CHANGE_CONTRIBUTION_AMOUNT_SUBMIT);
    const fieldVal = $(CONTRIBUTION_NEW_AMOUNT_FIELD).val();
    if (fieldVal && Number(fieldVal)){
        const newVal = Number(fieldVal);
        $(CONTRIBUTION_TOO_LOW_WARNING).addClass(IS_HIDDEN_CLASSNAME);
        $(CONTRIBUTION_TOO_HIGH_WARNING).addClass(IS_HIDDEN_CLASSNAME);
        $(CONTRIBUTION_NO_CHANGE_WARNING).addClass(IS_HIDDEN_CLASSNAME);
        if (newVal < 5) {
            submitButton.addClass(IS_DISABLED_CLASSNAME);
            $(CONTRIBUTION_TOO_LOW_WARNING).removeClass(IS_HIDDEN_CLASSNAME);
        }
        if (newVal > 2000) {
            submitButton.addClass(IS_DISABLED_CLASSNAME);
            $(CONTRIBUTION_TOO_HIGH_WARNING).removeClass(IS_HIDDEN_CLASSNAME);
        }
        if (newVal === Number(currentAmount)) {
            submitButton.addClass(IS_DISABLED_CLASSNAME);
            $(CONTRIBUTION_NO_CHANGE_WARNING).removeClass(IS_HIDDEN_CLASSNAME);
        }
    }
};

const displayChangeContributionForm = (currentPrice: string): void => {
    $(PACKAGE_NEXT_PAYMENT_AMOUNT_CONTAINER).addClass(IS_HIDDEN_CLASSNAME);
    $(PACKAGE_NEXT_PAYMENT_FORM_CONTAINER).removeClass(IS_HIDDEN_CLASSNAME);
    $(CONTRIBUTION_GLYPH).removeClass(IS_HIDDEN_CLASSNAME);
    $(CHANGE_CONTRIBUTION_AMOUNT_SUBMIT).addClass(IS_DISABLED_CLASSNAME);

    const priceEntryField = document.querySelector(CONTRIBUTION_NEW_AMOUNT_FIELD);
    if (priceEntryField) {
        priceEntryField.addEventListener('keyup', handlePriceChange);
        priceEntryField.addEventListener('blur', handlePriceChangeOnBlur);
        fastdom.write(() => {
            $(CONTRIBUTION_NEW_AMOUNT_FIELD).val(currentPrice);
        });
    }
};

const hideChangeContributionForm = (): void => {
    $(CONTRIBUTION_GLYPH).addClass(IS_HIDDEN_CLASSNAME);
    $(PACKAGE_NEXT_PAYMENT_FORM_CONTAINER).addClass(IS_HIDDEN_CLASSNAME);
    $(PACKAGE_NEXT_PAYMENT_AMOUNT_CONTAINER).removeClass(IS_HIDDEN_CLASSNAME);
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

    $(CURRENT_CONTRIBUTION_AMOUNT).text(
        contributorDetails.subscription.plan.amount / 100
    );

    $(CONTRIBUTION_GLYPH).text(
        glyph
    );

    $(CONTRIBUTION_TOO_LOW_WARNING).text(
        "Please enter an amount of " + formatAmount(500, glyph) + " or more"
    );

    $(CONTRIBUTION_TOO_HIGH_WARNING).text(
        "Thank you but we cannot accept contributions over " + formatAmount(200000, glyph)
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
        setupCancelContribution();
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
