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
const CONTRIBUTION_DETAILS = '.js-contribution-details';
const LOADER = '.js-contribution-loader';
const IS_HIDDEN_CLASSNAME = 'is-hidden';
const IS_DISABLED_CLASSNAME = 'is-disabled';
const ERROR = '.js-contribution-error';

const CANCEL_CONTRIBUTION = '.js-contribution-cancel';
const CANCEL_CONTRIBUTION_FORM = '.js-cancellation-form';
const CANCEL_CONTRIBUTION_MSG_SUCCESS = '.js-cancel-contribution-msg-success';
const CANCEL_CONTRIBUTION_MSG_ERROR = '.js-cancel-contribution-msg-error';
const CANCEL_CONTRIBUTION_LINK = '.js-cancel-contribution-link';
const KEEP_CONTRIBUTION_LINK = '.js-cancel-contribution-keep-contributing';
const CANCEL_CONTRIBUTION_SELECTOR = '.js-cancel-contribution-selector';
const CANCEL_CONTRIBUTION_SUBMIT = '.js-cancel-contribution-submit';

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

const hideContributionDetails = (): void => {
    $(CONTRIBUTION_DETAILS).addClass(IS_HIDDEN_CLASSNAME);
};

const hideCardDetails = (): void => {
    $(CARD_DETAILS).addClass(IS_HIDDEN_CLASSNAME);
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
        setupCancelContribution();
    } else {
        hideCancelContribution();
        hideContributionDetails();
        displaySupportUpSell();
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
