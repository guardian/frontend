define([
    'bean',
    'lib/$',
    'lib/fetch',
    'lib/config',
    'lib/report-error',
    'membership/formatters',
    'membership/stripe'
], function (bean,
             $,
             fetch,
             config,
             reportError,
             formatters,
             stripe) {

    var CARD_DETAILS = '.js-mem-card-details',
        PAYPAL = '.js-mem-paypal',
        CHANGE_TIER_CARD_LAST4 = '.js-mem-card-last4',
        PAYPAL_EMAIL_ADDRESS = '.js-paypal-email',
        PAYPAL_SHOW_EMAIL_BUTTON = '.js-show-paypal-button',
        PAYPAL_SHOW_EMAIL_MESSAGE = '.js-paypal-email-message',
        PACKAGE_COST = '.js-mem-package-cost',
        PACKAGE_CURRENT_RENEWAL_DATE = '.js-mem-current-renewal-date',
        PACKAGE_CURRENT_PERIOD_END = '.js-mem-current-period-end',
        PACKAGE_CURRENT_PERIOD_START = '.js-mem-current-period-start',
        PACKAGE_CURRENT_PERIOD_START_CONTAINER = '.js-mem-current-period-start-container',

        PACKAGE_NEXT_PAYMENT_CONTAINER = '.js-mem-next-payment-container',
        TRIAL_INFO_CONTAINER = '.js-mem-only-for-trials',
        PACKAGE_NEXT_PAYMENT_DATE = '.js-mem-next-payment-date',
        PACKAGE_NEXT_PAYMENT_PRICE = '.js-mem-next-payment-price',
        PACKAGE_INTERVAL = '.js-mem-plan-interval',
        DETAILS_MEMBERSHIP_TIER_ICON_CURRENT = '.js-mem-icon-current',
        DETAILS_JOIN_DATE = '.js-mem-join-date',
        DETAILS_MEMBER_NUM_TEXT = '.js-mem-number',
        NOTIFICATION_CANCEL = '.js-mem-cancel-tier',
        NOTIFICATION_CHANGE = '.js-mem-change-tier',
        MEMBER_DETAILS = '.js-mem-details',
        DETAILS_MEMBER_NUMBER_CONTAINER = '.js-mem-number-container',
        MEMBERSHIP_TIER = '.js-mem-tier',
        UP_SELL = '.js-mem-up-sell',
        MEMBER_INFO = '.js-mem-info',
        LOADER = '.js-mem-loader',
        IS_HIDDEN_CLASSNAME = 'is-hidden',
        ERROR = '.js-mem-error'
    ;

    function fetchUserDetails() {
        fetch(config.page.userAttributesApiUrl + '/me/mma-membership', {
            mode: 'cors',
            credentials: 'include',
        }).then(function (resp) {
            return resp.json();
        }).then(function (json) {
            if (json && json.subscription) {
                hideLoader();
                populateUserDetails(json);
            } else {
                hideLoader();
                displayMembershipUpSell();
            }
        }).catch(function (err) {
            hideLoader();
            displayErrorMessage();
            reportError(err, {feature: 'mma-membership'})
        });
    }

    function hideLoader() {
        $(LOADER).addClass(IS_HIDDEN_CLASSNAME);
    }


    function populateUserDetails(userDetails) {
        var isMonthly = userDetails.subscription.plan.interval === 'month',
            intervalText = isMonthly ? 'Monthly' : 'Annual',
            glyph = userDetails.subscription.plan.currency,
            notificationTypeSelector;

        $(MEMBERSHIP_TIER).text(userDetails.tier);
        $(PACKAGE_COST).text(formatters.formatAmount(userDetails.subscription.plan.amount, glyph));
        $(DETAILS_JOIN_DATE).text(formatters.formatDate(userDetails.joinDate));
        $(PACKAGE_INTERVAL).text(intervalText);

        if (userDetails.subscription.card) {
            $(CHANGE_TIER_CARD_LAST4).text(userDetails.subscription.card.last4);
        } else if (userDetails.subscription.payPalEmail) {
            $(PAYPAL_EMAIL_ADDRESS).text(userDetails.subscription.payPalEmail);
        }

        $(PACKAGE_CURRENT_PERIOD_END).text(formatters.formatDate(userDetails.subscription.end));
        $(PACKAGE_CURRENT_RENEWAL_DATE).text(formatters.formatDate(userDetails.subscription.renewalDate));

        if (userDetails.subscription.nextPaymentDate) {
            $(PACKAGE_NEXT_PAYMENT_DATE).text(formatters.formatDate(userDetails.subscription.nextPaymentDate));
            $(PACKAGE_NEXT_PAYMENT_CONTAINER).removeClass(IS_HIDDEN_CLASSNAME);
        }

        $(PACKAGE_NEXT_PAYMENT_PRICE).text(formatters.formatAmount(userDetails.subscription.nextPaymentPrice, glyph));

        if (userDetails.subscription.trialLength > 0) {
            $(TRIAL_INFO_CONTAINER).removeClass(IS_HIDDEN_CLASSNAME);
        }

        // display membership number
        if (userDetails.regNumber) {
            $(DETAILS_MEMBER_NUMBER_CONTAINER).removeClass(IS_HIDDEN_CLASSNAME);
            $(DETAILS_MEMBER_NUM_TEXT).text(userDetails.regNumber);
        }

        if (userDetails.subscription.start) {
            $(PACKAGE_CURRENT_PERIOD_START).text(formatters.formatDate(userDetails.subscription.start));
            $(PACKAGE_CURRENT_PERIOD_START_CONTAINER).removeClass(IS_HIDDEN_CLASSNAME);
        }

        // user has cancelled
        if (userDetails.subscription.cancelledAt) {
            // is this a tier change or a cancellation
            notificationTypeSelector = userDetails.optIn ? NOTIFICATION_CHANGE : NOTIFICATION_CANCEL;
            $(notificationTypeSelector).removeClass(IS_HIDDEN_CLASSNAME);
            $(MEMBER_DETAILS).addClass(IS_HIDDEN_CLASSNAME);
            $(DETAILS_MEMBERSHIP_TIER_ICON_CURRENT).addClass('i-g-' + userDetails.tier.toLowerCase());
        } else if (userDetails.subscription.card) {
            // only show card details if user hasn't changed their subscription and has stripe as payment method
            stripe.display(CARD_DETAILS, userDetails.subscription.card);
        } else if (userDetails.subscription.payPalEmail) {
            // if the user hasn't changed their subscription and has PayPal as a payment method
            $(PAYPAL).removeClass(IS_HIDDEN_CLASSNAME);
            bean.one($(PAYPAL_SHOW_EMAIL_BUTTON)[0], 'click', showPayPalAccountName);
        }

        $(MEMBER_INFO).removeClass(IS_HIDDEN_CLASSNAME);
    }

    function showPayPalAccountName() {
        $(PAYPAL_SHOW_EMAIL_MESSAGE).removeClass(IS_HIDDEN_CLASSNAME);
        var button = $(PAYPAL_SHOW_EMAIL_BUTTON);
        bean.one(button[0], 'click', hidePayPalAccountName);
        button.text("Hide account name");
    }

    function hidePayPalAccountName() {
        $(PAYPAL_SHOW_EMAIL_MESSAGE).addClass(IS_HIDDEN_CLASSNAME);
        var button = $(PAYPAL_SHOW_EMAIL_BUTTON);
        bean.one(button[0], 'click', showPayPalAccountName);
        button.text("Show account name");
    }

    function displayMembershipUpSell() {
        $(UP_SELL).removeClass(IS_HIDDEN_CLASSNAME);
    }

    function displayErrorMessage() {
        $(ERROR).removeClass(IS_HIDDEN_CLASSNAME);
    }

    function init() {
        fetchUserDetails();
    }

    return {
        init: init
    };
});
