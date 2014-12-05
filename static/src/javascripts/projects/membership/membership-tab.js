define([
    'bean',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'common/modules/component',
    'membership/payment-form'
], function (
    bean,
    $,
    ajax,
    config,
    Component,
    PaymentForm
) {

    function formatAmount(amount) {
        return amount ? '£' + (amount / 100).toFixed(2) : 'Free';
    }

    function formatDate(timestamp) { // eg: 4th June 2014
        var date = new Date(timestamp),
            months = [
                'January', 'Feburary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
                'November', 'December'
            ],
            day = date.getDate(),
            month = months[date.getMonth()],
            year = date.getFullYear();

        return day + ' ' + month + ' ' + year;
    }

    function Membership() {}

    Component.define(Membership);

    Membership.prototype.classes = {
        TAB: 'js-membership-tab',
        TAB_BUTTON: 'js-memebership-tab-button',
        TAB_CONTAINER: 'js-memebership-tab-container',
        TAB_DETAILS_LIST_UPPER: 'js-membership-details-list-upper',
        TAB_DETAILS_LIST_LOWER: 'js-membership-details-list-lower',
        TIER: 'js-membership-tier',
        COST: 'js-membership-payment-cost',
        JOIN_DATE: 'js-membership-join-date',
        INTERVAL: 'js-membership-plan-interval',
        CURRENT_PERIOD_START: 'js-membership-current-period-start',
        CURRENT_PERIOD_END: 'js-membership-current-period-end',
        CC_LAST4: 'js-membership-cc-last4',
        CC_TYPE: 'js-membership-cc-type',
        CC_TYPE_TEXT: 'js-membership-cc-type-text',
        NUM_CONTAINER: 'js-membership-number-container',
        NUM_TEXT: 'js-membership-number',
        CC_CHANGE_BUTTON: 'js-membership-change-cc-open',
        CC_CHANGE_FORM_CONT: 'js-membership-change-cc-form-cont',
        CC_CHANGE_FORM: 'js-membership-change-cc-form',
        CC_CHANGE_SUCCESS: 'js-membership-change-cc-success',
        NOTIFICATION_CANCEL: 'js-mem-cancel-tier',
        NOTIFICATION_CHANGE: 'js-mem-change-tier',
        NOTIFICATION_ICON_CURRENT: 'js-mem-icon-current'
    };

    /**
    * @type {string}
    * @override
    */
    Membership.prototype.endpoint = config.page.idUrl + '/membership.json';

    /**
    * @override
    * @type {string}
    */
    Membership.prototype.componentClass = 'js-membership-tab-container';

    /**
    *    If the user is a guardian member; Render the contents of the membership
    *    tab using the response from the /user/me/details
    */
    Membership.prototype.prerender = function () {
        var self = this;

        ajax({
            url: config.page.membershipUrl + '/user/me/details',
            crossOrigin: true,
            withCredentials: true,
            method: 'get'
        }).then(function (resp) {
            var intervalText = resp.subscription.plan.interval === 'month' ? 'Monthly' : 'Annual',
                notificationType;

            $(self.getClass('TIER')).text(resp.tier);
            $(self.getClass('COST')).text(formatAmount(resp.subscription.plan.amount));
            $(self.getClass('JOIN_DATE')).text(formatDate(resp.joinDate));
            $(self.getClass('INTERVAL')).text(intervalText);
            $(self.getClass('CURRENT_PERIOD_START')).text(formatDate(resp.subscription.start));
            $(self.getClass('CURRENT_PERIOD_END')).text(formatDate(resp.subscription.end));

            if (resp.regNumber) {
                $(self.getElem('NUM_CONTAINER')).removeClass('is-hidden');
                $(self.getElem('NUM_TEXT')).text(resp.regNumber);
            }

            if (resp.subscription.card) {
                self.updateCard(resp.subscription.card);
            }

            if (resp.subscription.cancelledAt) {
                notificationType = resp.optIn ? 'NOTIFICATION_CHANGE' : 'NOTIFICATION_CANCEL';
                $(self.getClass('TAB_DETAILS_LIST_UPPER')).addClass('is-hidden');
                $(self.getClass(notificationType)).removeClass('is-hidden');

                $(self.getClass('NOTIFICATION_ICON_CURRENT')).addClass('i-g-' + resp.tier.toLowerCase());
            // only show lower list if user hasn't changed their subscription and has a payment method
            } else if (resp.subscription.card) {
                $(self.getElem('TAB_DETAILS_LIST_LOWER')).removeClass('is-hidden');
            }

            self.reveal();
        });
    };

    /**
     *   Load the css file containing the base64 encoded sprites for the card icons
     */
    Membership.prototype.addSpriteCss = function () {
        var spriteSheetUrl = $(this.getClass('TAB')).data('sprite-url'),
            $head  = $('head'),
            link  = document.createElement('link');
        link.id   = 'membership-sprite';
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = spriteSheetUrl;
        link.media = 'all';
        $head.append(link);
    };

    Membership.prototype.toggleForm = function (show) {
        var $cont = $(this.getElem('CC_CHANGE_FORM_CONT')),
            $button = $(this.getElem('CC_CHANGE_BUTTON'));

        show = show !== undefined ? show : $cont.hasClass('is-closed');

        if (show) {
            $cont.removeClass('is-closed');
            $button.addClass('membership-tab__update-button--muted').text('Cancel');
        } else {
            $cont.addClass('is-closed');
            $button.removeClass('membership-tab__update-button--muted').text('Change card');
        }
    };

    Membership.prototype.updateCard = (function () {
        var currentClass;
        return function (card) {
            $(this.getClass('CC_LAST4')).text(card.last4);
            if (currentClass) {
                $(this.getClass('CC_TYPE')).removeClass(currentClass);
            }

            currentClass = 'i-' + card.type.toLowerCase().replace(' ', '-');
            $(this.getClass('CC_TYPE')).addClass(currentClass);
            $(this.getClass('CC_TYPE_TEXT')).text(card.type);
        };
    })();

    Membership.prototype.reveal = function () {
        var self = this;

        self.addSpriteCss();

        $(self.getClass('TAB_BUTTON'), self.context).removeClass('is-hidden');
        $(self.getClass('TAB_CONTAINER'), self.context).removeClass('is-hidden');
        $('.js-account-profile-forms').addClass('identity-wrapper--with-membership');

        self.paymentForm = new PaymentForm().init(self.getElem('CC_CHANGE_FORM_CONT'), function (newCard) {
            self.toggleForm(false);
            self.updateCard(newCard);
            $(self.getElem('CC_CHANGE_SUCCESS')).removeClass('is-hidden');
        });

        bean.on(self.getElem('CC_CHANGE_BUTTON'), 'click', function () {
            self.toggleForm();
            $(self.getElem('CC_CHANGE_SUCCESS')).addClass('is-hidden');
        });
    };

    return Membership;
});
