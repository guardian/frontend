define([
    'bean',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'mmaTabs/formatters'
], function (bean, $, ajax, config, formatters) {

    var PACKAGE_COST = '.js-dig-package-cost',
        SUBSCRIBER_ID = '.js-dig-subscriber-id',
        REMAINING_TRIAL_LENGTH = '.js-dig-remaining-trial-length',
        PACKAGE_CURRENT_RENEWAL_DATE = '.js-dig-current-renewal-date',
        PACKAGE_CURRENT_PERIOD_END = '.js-dig-current-period-end',
        PACKAGE_CURRENT_PERIOD_START = '.js-dig-current-period-start',
        PACKAGE_NEXT_PAYMENT_DATE = '.js-dig-next-payment-date',
        PACKAGE_NEXT_PAYMENT_PRICE = '.js-dig-next-payment-price',
        PACKAGE_INTERVAL = '.js-dig-plan-interval',
        DETAILS_JOIN_DATE = '.js-dig-join-date',
        NOTIFICATION_CANCEL = '.js-dig-cancel-tier',
        DIGITALPACK_DETAILS = '.js-dig-details',
        DIGITALPACK_PRODUCT = '.js-dig-product',
        UP_SELL = '.js-dig-up-sell',
        DIG_INFO = '.js-dig-info',
        LOADER = '.js-dig-loader',
        IS_HIDDEN_CLASSNAME = 'is-hidden';



    function fetchUserDetails() {
        ajax({

            url: config.page.userAttributesApiUrl + '/me/mma-digitalpack',
            crossOrigin: true,
            withCredentials: true,
            method: 'get'
        }).then(function (resp) {
            if (resp && resp.subscription) {
                hideLoader();
                populateUserDetails(resp);
            }
        }, function(error) {
            if (error.status == 404) {
                hideLoader();
                displayDigitalPackUpSell();
            }
        });
    }

    function hideLoader() {
        $(LOADER).addClass(IS_HIDDEN_CLASSNAME);
    }


    function populateUserDetails(userDetails) {

        // this needs to be fixed.
        var intervalText = userDetails.subscription.plan.interval === 'month' ? 'Monthly' : 'Annual';

        $(DIG_INFO).removeClass(IS_HIDDEN_CLASSNAME);
        $(SUBSCRIBER_ID).text(userDetails.subscription.subscriberId);
        $(DIGITALPACK_PRODUCT).text(userDetails.subscription.plan.name);
        $(PACKAGE_COST).text(formatters.formatAmount(userDetails.subscription.plan.amount));
        $(DETAILS_JOIN_DATE).text(formatters.formatDate(userDetails.joinDate));
        $(PACKAGE_INTERVAL).text(intervalText);
        $(PACKAGE_CURRENT_PERIOD_START).text(formatters.formatDate(userDetails.subscription.start));
        $(PACKAGE_CURRENT_PERIOD_END).text(formatters.formatDate(userDetails.subscription.end));
        $(PACKAGE_CURRENT_RENEWAL_DATE).text(formatters.formatDate(userDetails.subscription.renewalDate));

        var trialLeft = userDetails.subscription.trialLength;
        $(REMAINING_TRIAL_LENGTH).text(trialLeft + " day" + (trialLeft != 1 ? "s" : ""));

        $(PACKAGE_NEXT_PAYMENT_DATE).text(formatters.formatDate(userDetails.subscription.nextPaymentDate));
        $(PACKAGE_NEXT_PAYMENT_PRICE).text(formatters.formatAmount(userDetails.subscription.nextPaymentPrice));
        if (!userDetails.optIn) {
            $(NOTIFICATION_CANCEL).removeClass(IS_HIDDEN_CLASSNAME);
            $(DIGITALPACK_DETAILS).addClass(IS_HIDDEN_CLASSNAME);
        }
    }

    function displayDigitalPackUpSell() {
        $(UP_SELL).removeClass(IS_HIDDEN_CLASSNAME);
    }

    function init() {
        fetchUserDetails();
    }

    return {
        init: init
    };
});
