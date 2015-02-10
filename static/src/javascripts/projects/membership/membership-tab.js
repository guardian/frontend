define([
    'bean',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'membership/payment-form'
], function (bean, $, ajax, config, PaymentForm) {

    var PAYMENT_FORM = '.js-mem-stripe-form';
    var CARD_DETAILS = '.js-mem-card-details';
    var CHANGE_CARD = '.js-mem-change-card';
    var CARD_DETAILS_FORM_CONTAINER = '.js-mem-card-details-form-container';
    var CARD_CHANGE_SUCCESS_MSG = '.js-mem-card-change-success-msg';
    var CARD_LAST4 = '.js-mem-card-last4';
    var CARD_TYPE = '.js-mem-card-type';
    var PACKAGE_COST = '.js-mem-package-cost';
    var PACKAGE_CURRENT_PERIOD_END = '.js-mem-current-period-end';
    var PACKAGE_CURRENT_PERIOD_START = '.js-mem-current-period-start';
    var PACKAGE_INTERVAL = '.js-mem-plan-interval';
    var DETAILS_MEMBERSHIP_TIER_ICON_CURRENT = '.js-mem-icon-current';
    var DETAILS_JOIN_DATE = '.js-mem-join-date';
    var DETAILS_MEMBER_NUM_TEXT = '.js-mem-number';
    var NOTIFICATION_CANCEL = '.js-mem-cancel-tier';
    var NOTIFICATION_CHANGE = '.js-mem-change-tier';
    var MEMBER_DETAILS = '.js-mem-details';
    var DETAILS_MEMBER_NUMBER_CONTAINER = '.js-mem-number-container';
    var MEMBERSHIP_TAB = '.js-mem-tab';
    var MEMBERSHIP_TIER = '.js-mem-tier';
    var UP_SELL = '.js-mem-up-sell';
    var MEMBER_INFO = '.js-mem-info';
    var LOADER = '.js-mem-loader';
    var CLOSED_CLASSNAME = 'is-closed';
    var IS_HIDDEN_CLASSNAME = 'is-hidden';
    var CTA_DISABLED_CLASSNAME = 'membership-cta--disabled';

    function formatAmount (amount) {
        return amount ? '£' + (amount / 100).toFixed(2) : 'FREE';
    }

    function formatDate (timestamp) {
        var date = new Date(timestamp);
        var months = [
            'January',
            'Feburary',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];
        var day = date.getDate();
        var month = months[date.getMonth()];
        var year = date.getFullYear();

        return [day, month, year].join(' ');
    }

    var fetchUserDetails = function () {
        ajax({
            url: config.page.membershipUrl + '/user/me/details',
            crossOrigin: true,
            withCredentials: true,
            method: 'get'
        }).then(function (resp) {
            if (resp && resp.subscription) {
                hideLoader();
                populateUserDetails(resp);
                addSpriteCss();
                setupPaymentForm();
                addToggleFormListener();
            } else {
                hideLoader();
                displayMembershipUpSell();
            }
        });
    };

    var hideLoader = function () {
      $(LOADER).addClass(IS_HIDDEN_CLASSNAME);
    };

    var setupPaymentForm = function () {
        (new PaymentForm()).init($(PAYMENT_FORM)[0], function (newCard) {
            toggleForm(false);
            updateCard(newCard);
            $(CARD_CHANGE_SUCCESS_MSG).removeClass(IS_HIDDEN_CLASSNAME);
        });
    };

    var addToggleFormListener = function () {
        bean.on($(CHANGE_CARD)[0], 'click', function () {
            toggleForm();
            $(CARD_CHANGE_SUCCESS_MSG).addClass(IS_HIDDEN_CLASSNAME);
        });
    };

    var populateUserDetails = function (userDetails) {
        var intervalText = userDetails.subscription.plan.interval === 'month' ? 'Monthly' : 'Annual';
        var notificationTypeSelector;

        $(MEMBERSHIP_TIER).text(userDetails.tier);
        $(PACKAGE_COST).text(formatAmount(userDetails.subscription.plan.amount));
        $(DETAILS_JOIN_DATE).text(formatDate(userDetails.joinDate));
        $(PACKAGE_INTERVAL).text(intervalText);
        $(PACKAGE_CURRENT_PERIOD_START).text(formatDate(userDetails.subscription.start));
        $(PACKAGE_CURRENT_PERIOD_END).text(formatDate(userDetails.subscription.end));

        // display membership number
        if (userDetails.regNumber) {
            $(DETAILS_MEMBER_NUMBER_CONTAINER).removeClass(IS_HIDDEN_CLASSNAME);
            $(DETAILS_MEMBER_NUM_TEXT).text(userDetails.regNumber);
        }

        // update card details
        if (userDetails.subscription.card) {
            updateCard(userDetails.subscription.card);
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
            $(CARD_DETAILS).removeClass(IS_HIDDEN_CLASSNAME);
        }

        $(MEMBER_INFO).removeClass(IS_HIDDEN_CLASSNAME);
    };

    var displayMembershipUpSell = function () {
        $(UP_SELL).removeClass(IS_HIDDEN_CLASSNAME);
    };

    var addSpriteCss = function () {
        var spriteSheetUrl = $(MEMBERSHIP_TAB).data('sprite-url');
        var $head = $('head');
        var link = document.createElement('link');

        link.id = 'membership-sprite';
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = spriteSheetUrl;
        link.media = 'all';
        $head.append(link);
    };

    var toggleForm = function (show) {
        var $cont = $(CARD_DETAILS_FORM_CONTAINER);
        var $button = $(CHANGE_CARD);

        show = show !== undefined ? show : $cont.hasClass(CLOSED_CLASSNAME);

        if (show) {
            $cont.removeClass(CLOSED_CLASSNAME);
            $button.addClass(CTA_DISABLED_CLASSNAME).text('Cancel');
        } else {
            $cont.addClass(CLOSED_CLASSNAME);
            $button.removeClass(CTA_DISABLED_CLASSNAME).text('Change card');
        }
    };

    var updateCard = function (card) {
        var cardTypeClassName;
        var $cardTypeElem;

        cardTypeClassName = card.type.toLowerCase().replace(' ', '-');
        $cardTypeElem = $(CARD_TYPE);
        $(CARD_LAST4).text(card.last4);
        $cardTypeElem[0].className = $cardTypeElem[0].className.replace(/\bi-\S+/g, '');
        $cardTypeElem.addClass('i-' + cardTypeClassName);
    };

    var init = function () {
        fetchUserDetails();
    };

    return {
        init: init
    };
});
