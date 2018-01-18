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
const PACKAGE_NEXT_PAYMENT_FORM_CONTAINER =
    '.js-contribution-next-payment-form-container';
const PACKAGE_NEXT_PAYMENT_DATE = '.js-contribution-next-payment-date';
const PACKAGE_NEXT_PAYMENT_PRICE = '.js-contribution-next-payment-price';
const PACKAGE_INTERVAL = '.js-contribution-plan-interval';
const UP_SELL = '.js-contribution-up-sell';
const CONTRIBUTION_INFO = '.js-contribution-info';
const CONTRIBUTION_DETAILS = '.js-contribution-details';
const LOADER = '.js-recurring-contribution-loader';
const IS_HIDDEN_CLASSNAME = 'is-hidden';
const IS_DISABLED_CLASSNAME = 'is-disabled';
const ERROR = '.js-contribution-error';
const CONTRIBUTION_UPDATE_ERROR = '.js-contribution-update-error-msg';

const CANCEL_CONTRIBUTION = '.js-contribution-cancel';
const CANCEL_CONTRIBUTION_FORM = '.js-cancellation-form';
const CANCEL_CONTRIBUTION_MSG_SUCCESS = '.js-cancel-contribution-msg-success';
const CANCEL_CONTRIBUTION_MSG_ERROR = '.js-cancel-contribution-msg-error';
const CANCEL_CONTRIBUTION_LINK = '.js-cancel-contribution-link';
const KEEP_CONTRIBUTION_LINK = '.js-cancel-contribution-keep-contributing';
const CANCEL_CONTRIBUTION_SELECTOR = '.js-cancel-contribution-selector';
const CANCEL_CONTRIBUTION_SUBMIT = '.js-cancel-contribution-submit';

const CONTRIBUTION_UPDATE_FORM = '.js-contribution-update-form';
const CURRENT_CONTRIBUTION_AMOUNT = '.js-current-contribution-amount';
const CONTRIBUTION_GLYPH = '.js-contribution-glyph';
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
const CONTRIBUTION_INVALID_NUMBER_WARNING =
    '.js-manage-account-change-contribution-amount-invalid';
const CONTRIBUTION_HIGH_AMOUNT_WARNING =
    '.js-manage-account-change-contribution-amount-verify';
const CONTRIBUTION_CHANGE_SUCCESS = '.js-contribution-change-success-msg';
const displayLoader = (): void => {
    $(LOADER).removeClass(IS_HIDDEN_CLASSNAME);
};

const hideLoader = (): void => {
    $(LOADER).addClass(IS_HIDDEN_CLASSNAME);
};

const displayContributionInfo = (): void => {
    $(CONTRIBUTION_INFO).removeClass(IS_HIDDEN_CLASSNAME);
};

const hideContributionInfo = (): void => {
    $(CONTRIBUTION_INFO).addClass(IS_HIDDEN_CLASSNAME);
};

const displaySupportUpSell = (): void => {
    $(UP_SELL).removeClass(IS_HIDDEN_CLASSNAME);
};

const displayErrorMessage = (): void => {
    $(ERROR).removeClass(IS_HIDDEN_CLASSNAME);
};

const hideContributionDetails = (): void => {
    $(CONTRIBUTION_DETAILS).addClass(IS_HIDDEN_CLASSNAME);
};

const hideCardDetails = (): void => {
    $(CARD_DETAILS).addClass(IS_HIDDEN_CLASSNAME);
};

const displayContributionUpdateErrorMessage = (): void => {
    $(CONTRIBUTION_UPDATE_ERROR).removeClass(IS_HIDDEN_CLASSNAME);
};

const hideContributionUpdateErrorMessage = (): void => {
    $(CONTRIBUTION_UPDATE_ERROR).addClass(IS_HIDDEN_CLASSNAME);
};

const displayContributionUpdateSuccessMessage = (): void => {
    $(CONTRIBUTION_CHANGE_SUCCESS).removeClass(IS_HIDDEN_CLASSNAME);
};

const hideContributionUpdateSuccessMessage = (): void => {
    $(CONTRIBUTION_CHANGE_SUCCESS).addClass(IS_HIDDEN_CLASSNAME);
};

const displayPayPal = (): void => {
    $(PAYPAL).removeClass(IS_HIDDEN_CLASSNAME);
    $(PAYPAL_SHOW_EMAIL_BUTTON).addClass(IS_HIDDEN_CLASSNAME); // always hide
};

const hidePayPal = (): void => {
    $(PAYPAL).addClass(IS_HIDDEN_CLASSNAME);
    $(PAYPAL_SHOW_EMAIL_BUTTON).addClass(IS_HIDDEN_CLASSNAME);
};

const displayInvalidNumberWarning = (): void => {
    $(CONTRIBUTION_INVALID_NUMBER_WARNING).removeClass(IS_HIDDEN_CLASSNAME);
};

const hideInvalidNumberWarning = (): void => {
    $(CONTRIBUTION_INVALID_NUMBER_WARNING).addClass(IS_HIDDEN_CLASSNAME);
};

const displayHighContributionWarningMessage = (): void => {
    $(CONTRIBUTION_HIGH_AMOUNT_WARNING).removeClass(IS_HIDDEN_CLASSNAME);
};

const hideHighContributionWarningMessage = (): void => {
    $(CONTRIBUTION_HIGH_AMOUNT_WARNING).addClass(IS_HIDDEN_CLASSNAME);
};

const disablePriceChangeConfirmButton = (): void => {
    $(CHANGE_CONTRIBUTION_AMOUNT_SUBMIT).addClass(IS_DISABLED_CLASSNAME);
};

const enablePriceChangeConfirmButton = (): void => {
    $(CHANGE_CONTRIBUTION_AMOUNT_SUBMIT).removeClass(IS_DISABLED_CLASSNAME);
};

const displayContributionTooHighWarning = (): void => {
    $(CONTRIBUTION_TOO_HIGH_WARNING).removeClass(IS_HIDDEN_CLASSNAME);
};

const hideContributionTooHighWarning = (): void => {
    $(CONTRIBUTION_TOO_HIGH_WARNING).addClass(IS_HIDDEN_CLASSNAME);
};

const displayContributionTooLowWarning = (): void => {
    $(CONTRIBUTION_TOO_LOW_WARNING).removeClass(IS_HIDDEN_CLASSNAME);
};

const hideContributionTooLowWarning = (): void => {
    $(CONTRIBUTION_TOO_LOW_WARNING).addClass(IS_HIDDEN_CLASSNAME);
};

const displayContributionNoChangeWarning = (): void => {
    $(CONTRIBUTION_NO_CHANGE_WARNING).removeClass(IS_HIDDEN_CLASSNAME);
};

const hideContributionNoChangeWarning = (): void => {
    $(CONTRIBUTION_NO_CHANGE_WARNING).addClass(IS_HIDDEN_CLASSNAME);
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

const displayChangeContributionAmountButton = (): void => {
    $(CHANGE_CONTRIBUTION_AMOUNT_BUTTON).removeClass(IS_HIDDEN_CLASSNAME);
};

const hideChangeContributionAmountButton = (): void => {
    $(CHANGE_CONTRIBUTION_AMOUNT_BUTTON).addClass(IS_HIDDEN_CLASSNAME);
};

const hideCancelContributionForm = (): void => {
    $(CANCEL_CONTRIBUTION_FORM).addClass(IS_HIDDEN_CLASSNAME);
};

const displayCancelContributionSuccessMessage = (): void => {
    $(CANCEL_CONTRIBUTION_MSG_SUCCESS).removeClass(IS_HIDDEN_CLASSNAME);
};

const hideCancelContributionSuccessMessage = (): void => {
    $(CANCEL_CONTRIBUTION_MSG_SUCCESS).addClass(IS_HIDDEN_CLASSNAME);
};

const displayCancelContributionErrorMessage = (): void => {
    $(CANCEL_CONTRIBUTION_MSG_ERROR).removeClass(IS_HIDDEN_CLASSNAME);
};

const hideCancelContributionErrorMessage = (): void => {
    $(CANCEL_CONTRIBUTION_MSG_ERROR).addClass(IS_HIDDEN_CLASSNAME);
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
    disableCancellationSubmit();

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
    )
        .then(resp => {
            hideContributionDetails();
            hideCardDetails();
            hideCancelContributionForm();
            hideContributionUpdateSuccessMessage(); // in case user changed their contribution amount prior to cancel
            hidePayPal();
            if (resp.status === 200) {
                displayCancelContributionSuccessMessage();
            } else {
                throw new Error(
                    'Members Data API returned HTTP different from 200 for cancel contribution'
                );
            }
            displaySupportUpSell();
        })
        .catch(err => {
            displayCancelContributionErrorMessage();
            reportError(err, {
                feature: 'mma-monthlycontribution-cancel-contribution',
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
    hideCancelContributionErrorMessage();
    displayCancelContributionLink();
    displayCancelContribution();

    const cancelLink = document.querySelector(CANCEL_CONTRIBUTION_LINK);

    if (cancelLink) {
        cancelLink.addEventListener('click', handleCancelLink);
    }
};

const validatePriceChangeInput = (): void => {
    const currentAmount = $(CURRENT_CONTRIBUTION_AMOUNT).text();
    const fieldVal = $(CONTRIBUTION_NEW_AMOUNT_FIELD).val();

    hideContributionTooLowWarning();
    hideContributionTooHighWarning();
    hideContributionNoChangeWarning();
    hideHighContributionWarningMessage();
    hideInvalidNumberWarning();

    if (fieldVal && Number(fieldVal)) {
        const currentVal = Number(currentAmount) / 100;
        const newVal = Number(fieldVal);
        if (newVal >= 2 && newVal <= 2000 && newVal !== currentVal) {
            enablePriceChangeConfirmButton();
        } else {
            disablePriceChangeConfirmButton();
        }
        if (newVal > 2000) {
            hideHighContributionWarningMessage();
            displayContributionTooHighWarning();
        } else if (newVal >= 50) {
            displayHighContributionWarningMessage();
        } else if (newVal === currentVal) {
            displayContributionNoChangeWarning();
        } else if (newVal < 2) {
            displayContributionTooLowWarning();
        }
    } else {
        disablePriceChangeConfirmButton();
        displayInvalidNumberWarning();
    }
};

const toggleAmountChangeInputMode = (active: boolean): void => {
    if (active) {
        $(PACKAGE_NEXT_PAYMENT_AMOUNT_CONTAINER).addClass(IS_HIDDEN_CLASSNAME);
        $(CHANGE_CONTRIBUTION_AMOUNT_BUTTON).addClass(IS_HIDDEN_CLASSNAME);
        $(PACKAGE_NEXT_PAYMENT_FORM_CONTAINER).removeClass(IS_HIDDEN_CLASSNAME);
        $(CONTRIBUTION_GLYPH).removeClass(IS_HIDDEN_CLASSNAME);
        $(CHANGE_CONTRIBUTION_AMOUNT_SUBMIT).addClass(IS_DISABLED_CLASSNAME);
        $(CONTRIBUTION_UPDATE_FORM).removeClass(IS_HIDDEN_CLASSNAME);
    } else {
        $(CONTRIBUTION_UPDATE_FORM).addClass(IS_HIDDEN_CLASSNAME);
        $(CONTRIBUTION_GLYPH).addClass(IS_HIDDEN_CLASSNAME);
        $(PACKAGE_NEXT_PAYMENT_FORM_CONTAINER).addClass(IS_HIDDEN_CLASSNAME);
        $(PACKAGE_NEXT_PAYMENT_AMOUNT_CONTAINER).removeClass(
            IS_HIDDEN_CLASSNAME
        );
        $(CHANGE_CONTRIBUTION_AMOUNT_BUTTON).removeClass(IS_HIDDEN_CLASSNAME);
    }
};

const setupEditableNewAmountField = (currentPrice: string): void => {
    const priceEntryField = document.querySelector(
        CONTRIBUTION_NEW_AMOUNT_FIELD
    );
    if (priceEntryField) {
        priceEntryField.addEventListener('keyup', validatePriceChangeInput);
        priceEntryField.addEventListener('blur', validatePriceChangeInput);
        fastdom.write(() => {
            $(CONTRIBUTION_NEW_AMOUNT_FIELD).val(currentPrice);
        });
    }
};

const changeContributionAmountSubmit = (): void => {
    if ($(CHANGE_CONTRIBUTION_AMOUNT_SUBMIT).hasClass(IS_DISABLED_CLASSNAME)) {
        return;
    }
    const newAmount = $(CONTRIBUTION_NEW_AMOUNT_FIELD).val();
    toggleAmountChangeInputMode(false);
    hideContributionUpdateSuccessMessage();
    hideContributionUpdateErrorMessage();
    hideContributionInfo();
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
    )
        .then(resp => {
            hideLoader();
            if (resp.status === 200) {
                // eslint-disable-next-line no-use-before-define
                recurringContributionTab(true);
            } else {
                displayContributionUpdateErrorMessage();
                throw new Error(
                    'Members Data API returned non-200 result for contribution-update-amount'
                );
            }
        })
        .catch(err => {
            hideLoader();
            hideContributionUpdateSuccessMessage();
            displayContributionUpdateErrorMessage();
            reportError(err, {
                feature: 'mma-monthlycontribution',
            });
        });
};

const changeAmountButtonOnClick = (): void => {
    const currentAmount = $(CURRENT_CONTRIBUTION_AMOUNT).text();
    toggleAmountChangeInputMode(true);
    setupEditableNewAmountField(formatAmount(currentAmount, '').toString());
};

const changeAmountCancelButtonOnClick = (): void => {
    toggleAmountChangeInputMode(false);
};

const populateUserDetails = (contributorDetails: ContributorDetails): void => {
    const isMonthly = contributorDetails.subscription.plan.interval === 'month';
    const intervalText = isMonthly ? 'Monthly' : 'Annual';
    const glyph = contributorDetails.subscription.plan.currency;
    const isPayPal =
        contributorDetails.subscription.paymentMethod.toLowerCase() ===
        'paypal';

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
        formatAmount(contributorDetails.subscription.nextPaymentPrice, glyph)
    );

    $(CURRENT_CONTRIBUTION_AMOUNT).text(
        contributorDetails.subscription.nextPaymentPrice
    );

    $(CONTRIBUTION_GLYPH).text(glyph);

    $(CONTRIBUTION_NO_CHANGE_WARNING).text(
        `Your current contribution is ${formatAmount(
            contributorDetails.subscription.nextPaymentPrice,
            glyph
        )} per ${isMonthly ? 'month' : 'year'}. 
        Please enter a different amount.`
    );

    $(CONTRIBUTION_TOO_LOW_WARNING).text(
        `Please enter an amount of ${formatAmount(200, glyph)} or more`
    );

    $(CONTRIBUTION_TOO_HIGH_WARNING).text(
        `Thank you but we cannot accept contributions over ${formatAmount(
            200000,
            glyph
        )}`
    );

    if (isPayPal) {
        /* PayPal users manage their contribution on the PayPal site */
        hideChangeContributionAmountButton();
    } else {
        displayChangeContributionAmountButton();

        const changeAmountButton = document.querySelector(
            CHANGE_CONTRIBUTION_AMOUNT_BUTTON
        );
        if (changeAmountButton) {
            changeAmountButton.addEventListener(
                'click',
                changeAmountButtonOnClick
            );
        }
        const changeAmountCancelButton = document.querySelector(
            CHANGE_CONTRIBUTION_AMOUNT_CANCEL
        );
        if (changeAmountCancelButton) {
            changeAmountCancelButton.addEventListener(
                'click',
                changeAmountCancelButtonOnClick
            );
        }

        const changeAmountConfirmButton = document.querySelector(
            CHANGE_CONTRIBUTION_AMOUNT_SUBMIT
        );
        if (changeAmountConfirmButton) {
            changeAmountConfirmButton.addEventListener(
                'click',
                changeContributionAmountSubmit
            );
        }
    }

    if (contributorDetails.subscription.start) {
        $(CONTRIBUTION_PERIOD_START).text(
            formatDate(contributorDetails.subscription.start)
        );
        $(CONTRIBUTION_PERIOD_START_CONTAINER).removeClass(IS_HIDDEN_CLASSNAME);
    }

    if (!contributorDetails.subscription.cancelledAt) {
        if (contributorDetails.subscription.card) {
            display(
                CARD_DETAILS,
                contributorDetails.subscription.card,
                contributorDetails.subscription.card.stripePublicKeyForUpdate
            );
        } else if (isPayPal) {
            displayPayPal();
        }
        setupCancelContribution();
    } else {
        hideCancelContribution();
        hideContributionDetails();
        displaySupportUpSell();
    }
};

// eslint-disable-next-line func-style
export function recurringContributionTab(wasUpdated: boolean = false): void {
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
                if (wasUpdated) {
                    displayContributionUpdateSuccessMessage();
                } else {
                    hideContributionUpdateSuccessMessage();
                }
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
}
