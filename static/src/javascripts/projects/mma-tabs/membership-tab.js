define([
    'bean',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'mmaTabs/payment-form',
    'mmaTabs/formatters'
], function (bean, $, ajax, config, PaymentForm, formatters) {

    var PAYMENT_FORM = '.js-mem-card-details',
        CARD_CHANGE_SUCCESS_MSG = '.js-mem-card-change-success-msg',
        PACKAGE_COST = '.js-mem-package-cost',
        PACKAGE_CURRENT_RENEWAL_DATE = '.js-mem-current-renewal-date',
        PACKAGE_CURRENT_PERIOD_END = '.js-mem-current-period-end',
        PACKAGE_CURRENT_PERIOD_START = '.js-mem-current-period-start',
        PACKAGE_NEXT_PAYMENT_CONTAINER = 'js-mem-next-payment-container',
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
        MEMBERSHIP_TAB = '.js-mem-tab',
        MEMBERSHIP_TIER = '.js-mem-tier',
        UP_SELL = '.js-mem-up-sell',
        MEMBER_INFO = '.js-mem-info',
        LOADER = '.js-mem-loader',
        IS_HIDDEN_CLASSNAME = 'is-hidden',
        stripeForm = new PaymentForm();

    function fetchUserDetails() {
        ajax({

            url: config.page.userAttributesApiUrl + '/me/mma-membership',
            crossOrigin: true,
            withCredentials: true,
            method: 'get'
        }).then(function (resp) {
            if (resp && resp.subscription) {
                hideLoader();
                setupPaymentForm();
                populateUserDetails(resp);
                addSpriteCss();
            }
        }, function (error) {
            if (error.status == 404) {
                hideLoader();
                displayMembershipUpSell();
            }
        });
    }

    function hideLoader() {
        $(LOADER).addClass(IS_HIDDEN_CLASSNAME);
    }

    function setupPaymentForm() {
        stripeForm.init($(PAYMENT_FORM)[0], $(CARD_CHANGE_SUCCESS_MSG));
    }


    function populateUserDetails(userDetails) {
        var intervalText = userDetails.subscription.plan.interval === 'month' ? 'Monthly' : 'Annual',
            notificationTypeSelector;

        $(MEMBERSHIP_TIER).text(userDetails.subscription.plan.name);
        $(PACKAGE_COST).text(formatters.formatAmount(userDetails.subscription.plan.amount));
        $(DETAILS_JOIN_DATE).text(formatters.formatDate(userDetails.joinDate));
        $(PACKAGE_INTERVAL).text(intervalText);
        $(PACKAGE_CURRENT_PERIOD_START).text(formatters.formatDate(userDetails.subscription.start));
        $(PACKAGE_CURRENT_PERIOD_END).text(formatters.formatDate(userDetails.subscription.end));
        $(PACKAGE_CURRENT_RENEWAL_DATE).text(formatters.formatDate(userDetails.subscription.renewalDate));

        $(PACKAGE_NEXT_PAYMENT_DATE).text(formatters.formatDate(userDetails.subscription.nextPaymentDate));
        $(PACKAGE_NEXT_PAYMENT_PRICE).text(formatters.formatAmount(userDetails.subscription.nextPaymentPrice));

        if (userDetails.subscription.nextPaymentDate === userDetails.subscription.renewalDate) {
            $(PACKAGE_NEXT_PAYMENT_CONTAINER).addClass(IS_HIDDEN_CLASSNAME);
        }

        // display membership number
        if (userDetails.regNumber) {
            $(DETAILS_MEMBER_NUMBER_CONTAINER).removeClass(IS_HIDDEN_CLASSNAME);
            $(DETAILS_MEMBER_NUM_TEXT).text(userDetails.regNumber);
        }

        // update card details
        if (userDetails.subscription.card) {
            stripeForm.updateCard(userDetails.subscription.card);
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
            stripeForm.showCardDetailsElement();
        }

        $(MEMBER_INFO).removeClass(IS_HIDDEN_CLASSNAME);
    }

    function displayMembershipUpSell() {
        $(UP_SELL).removeClass(IS_HIDDEN_CLASSNAME);
    }

    function addSpriteCss() {
        var spriteSheetUrl = $(MEMBERSHIP_TAB).data('sprite-url'),
            $head = $('head'),
            link = document.createElement('link');

        link.id = 'membership-sprite';
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = spriteSheetUrl;
        link.media = 'all';
        $head.append(link);
    }

    function init() {
        fetchUserDetails();
    }

    return {
        init: init
    };
});
