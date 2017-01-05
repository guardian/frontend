define([
    'bean',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'membership/formatters',
    'membership/stripe'
], function (bean, $, ajax, config,  formatters, stripe) {

    var CARD_DETAILS = '.js-mem-card-details',
        CHANGE_TIER_CARD_LAST4 = '.js-mem-card-last4',
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
        IS_HIDDEN_CLASSNAME = 'is-hidden';

    function fetchUserDetails() {
        ajax({
            url: config.page.userAttributesApiUrl + '/me/mma-membership',
            crossOrigin: true,
            withCredentials: true,
            method: 'get'
        }).then(function (resp) {
            if (resp && resp.subscription) {
                hideLoader();
                populateUserDetails(resp);
            } else {
                hideLoader();
                displayMembershipUpSell();
            }
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
            // only show card details if user hasn't changed their subscription and has a payment method
            stripe.display(CARD_DETAILS, userDetails.subscription.card);
        }

        $(MEMBER_INFO).removeClass(IS_HIDDEN_CLASSNAME);
    }

    function displayMembershipUpSell() {
        $(UP_SELL).removeClass(IS_HIDDEN_CLASSNAME);
    }

    function init() {
        fetchUserDetails();
    }

    return {
        init: init
    };
});
