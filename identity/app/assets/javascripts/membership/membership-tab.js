/*
* If user is a member, display a membership tab on edit profile page
*/
define(['common/utils/$',
'bean',
'common/utils/ajax',
'common/utils/config',
'common/modules/component',
'membership/paymentForm'], function ($, bean, ajax, config, Component, PaymentForm) {

    function Membership (context, options) {

        this.context = context || document;

        options = options || {};

        options.messages = {
            CHANGE_CC_SUCCESS: 'Your card details have been updated'
        };

        this.setOptions(options);
    }

    Component.define(Membership);

    Membership.prototype.classes = {
        TAB: 'js-membership-tab',
        TAB_BUTTON: 'js-memebership-tab-button',
        TAB_CONTAINER: 'js-memebership-tab-container',
        TAB_DETAILS_LIST_UPPER: 'js-membership-details-list-upper',
        TAB_DETAILS_LIST_LOWER: 'js-membership-details-list-lower',
        TIER: 'js-membership-tier',
        COST: 'js-membership-payment-cost',
        JOIN: 'js-membership-join-date',
        NEXT: 'js-membership-payment-next',
        INTERVAL: 'js-membership-plan-interval',
        CC_NUM: 'js-membership-card-details',
        CC_LAST4: 'js-membership-card-lastfour',
        CC_TYPE: 'js-membership-card-type',
        CC_TYPE_TEXT: 'js-membership-card-text',
        CC_CHANGE_BUTTON: 'js-membership-change-cc-open',
        CC_CHANGE_FORM_CONT: 'js-membership-change-cc-form-cont',
        CC_CHANGE_FORM: 'js-membership-change-cc-form',
        ANIM_OPEN: 'membership-tab__change-cc-form-cont--to-open',
        ANIM_OPENED: 'membership-tab__change-cc-form-cont--open',
        ANIM_CLOSE: 'membership-tab__change-cc-form-cont--to-closed',
        ANIM_CLOSED: 'membership-tab__change-cc-form-cont--closed',
        NOTIFICATION_TIER_CURRENT: 'js-mem-tier-current',
        NOTIFICATION_TIER_TARGET: 'js-mem-tier-target',
        NOTIFICATION_TIER_HREF: 'js-mem-tier-href',
        NOTIFICATION_PERIOD_START: 'js-mem-current-period-start',
        NOTIFICATION_PERIOD_END: 'js-mem-current-period-end',
        NOTIFICATION_CANCEL: 'js-mem-cancel-tier',
        NOTIFICATION_CHANGE: 'js-mem-change-tier',
        NOTIFICATION_NEW_START: 'js-mem-new-start',
        NOTIFICATION_ICON_CURRENT: 'js-mem-icon-current',
        NOTIFICATION_ICON_TARGET: 'js-mem-icon-target'
    };

    /**
    * @type {string}
    * @override
    */
    Membership.prototype.endpoint = config.page.idUrl+'/membership.json';

    /**
    * @override
    * @type {string}
    */
    Membership.prototype.componentClass = 'js-memebership-tab-container';

    Membership.prototype.formatDate = function (date) { // eg: 4th Jun 2014

        var months = [  'January',
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
                        'December'];

        var day = date.getDate();
        var month = months[date.getMonth()];
        var year = date.getFullYear();

        return day + ' ' + month + ' ' + year;
    };

    /**
     * Friend tier is 0, Partner and Patron need their amounts displayed
     * @param amount
     * @returns {string}
     */
    Membership.prototype.formatAmount = function (amount) {
        return (amount === 0) ? 'free' : (amount / 100).toFixed(2);
    };

    /**
    *    If the user is a guardian member; Render the contents of the membership
    *    tab using the response from the /user/me
    */
    Membership.prototype.prerender = function () {
        var self = this,
            membershipUrl = config.page.membershipUrl,
            tierName,
            subscriptionCurrentPeriodStart,
            subscriptionCurrentPeriodEnd,
            memberOptIn,
            subscriptionIsCancelled,
            subscriptionInterval,
            notificationCancelElement = self.getElem('NOTIFICATION_CANCEL'),
            notificationChangeElement = self.getElem('NOTIFICATION_CHANGE'),
            tierHref;

        ajax({
            url: membershipUrl + '/user/me/details',
            crossOrigin: true,
            withCredentials: true,
            method: 'get'
        }).then(function (resp) {
            tierName = resp.tier;
            subscriptionCurrentPeriodStart = self.formatDate(new Date(resp.subscription.start));
            subscriptionCurrentPeriodEnd = self.formatDate(new Date(resp.subscription.end));
            memberOptIn = resp.optIn;
            subscriptionIsCancelled = !!!resp.subscription.cancelledAt;
            subscriptionInterval = resp.subscription.plan.interval === 'month' ? 'Monthly' : 'Annual',
            upperTabDetailsList = self.getClass('TAB_DETAILS_LIST_UPPER'),
            lowerTabDetailsList = self.getClass('TAB_DETAILS_LIST_LOWER');

            // populate tab
            self.display = true;
            $(self.getClass('TIER'), upperTabDetailsList).text(resp.subscription.plan.name);
            $(self.getClass('COST')).each(function () {
                this.innerHTML = '&pound;'+self.formatAmount(resp.subscription.plan.amount);
            });
            $(self.getClass('JOIN'), upperTabDetailsList).text(self.formatDate(new Date(resp.joinDate)));

            if (tierName === 'Partner' || tierName === 'Patron') {

                //var memberOptIn = true;
                var subscriptionIsCancelled = false;

                if(!memberOptIn) {
                    // Change package in process

                    var subscriptionNewStartDate = self.formatDate(
                        new Date(
                                new Date(resp.subscription.end).getTime() + (24 * 60 * 60 * 1000)
                        )
                    );
                    $(self.getClass('TAB_DETAILS_LIST_UPPER'), self.context).addClass('is-hidden');
                    $(notificationChangeElement, self.context).removeClass('is-hidden');
                    $(self.getClass('NOTIFICATION_TIER_CURRENT'), notificationChangeElement).html(tierName);
                    $(self.getClass('NOTIFICATION_TIER_TARGET'), notificationChangeElement).html('Friend');
                    $(self.getClass('NOTIFICATION_PERIOD_START'), notificationChangeElement).html(subscriptionCurrentPeriodStart);
                    $(self.getClass('NOTIFICATION_PERIOD_END'), notificationChangeElement).html(subscriptionCurrentPeriodEnd);
                    $(self.getClass('NOTIFICATION_NEW_START'), notificationChangeElement).html(subscriptionNewStartDate);
                    $(self.getClass('NOTIFICATION_ICON_CURRENT'), notificationChangeElement).addClass('i-g-'+tierName.toLowerCase());
                    $(self.getClass('NOTIFICATION_ICON_TARGET'), notificationChangeElement).addClass('i-g-'+'friend');
                    $(self.getClass('CC_LAST4'), notificationChangeElement).text(resp.subscription.card.last4);

                } else if(subscriptionIsCancelled) {
                    // Cancellation in progress

                    $(self.getClass('TAB_DETAILS_LIST_UPPER'), self.context).addClass('is-hidden');
                    $(notificationCancelElement, self.context).removeClass('is-hidden');
                    tierHref = tierName.toLowerCase() === 'patron' ? membershipUrl + '/join/patron' : membershipUrl + '/join';
                    $(self.getClass('NOTIFICATION_TIER'), notificationCancelElement).html(tierName);
                    $(self.getClass('NOTIFICATION_TIER_HREF'), notificationCancelElement).attr('href', tierHref);
                    $(self.getClass('NOTIFICATION_PERIOD_START'), notificationCancelElement).html(subscriptionCurrentPeriodStart);
                    $(self.getClass('NOTIFICATION_PERIOD_END'), notificationCancelElement).html(subscriptionCurrentPeriodEnd);

                } else {
                    // Regular membership tab

                    $(lowerTabDetailsList, self.context).removeClass('is-hidden');
                    $(self.getClass('INTERVAL'), self.context).html(subscriptionInterval);
                    $(self.getClass('NEXT'), lowerTabDetailsList).text(self.formatDate(new Date(resp.subscription.end)));
                    $(self.getClass('CC_LAST4'), lowerTabDetailsList).text(resp.subscription.card.last4);

                    self.currentCardTypeClass = 'i-' + resp.subscription.card.type.toLowerCase().replace(' ', '-');

                    $(self.getClass('CC_TYPE'), lowerTabDetailsList).addClass(self.currentCardTypeClass);
                    $(self.getClass('CC_TYPE_TEXT'), lowerTabDetailsList).text(resp.subscription.card.type);

                }

            }

            self.ready();
        });
    };

    /**
     *   Load the css file containing the base64 encoded sprites for the card icons
     */
    Membership.prototype.addSpriteCss = function () {
        var spriteSheetUrl = $(this.getClass('TAB')).data('sprite-url');
        var $head  = $('head');
        var link  = document.createElement('link');
        link.id   = 'membership-sprite';
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = spriteSheetUrl;
        link.media = 'all';
        $head.append(link);
    };

    Membership.prototype.appendSuccessMessage = function (message) {
        if (this.$successMessageElem) {
            this.$successMessageElem.text(message);
        } else {
            this.$successMessageElem = $.create('<div>').addClass('form__success').text(message).prependTo(this.getClass('TAB_CONTAINER'));
        }
    };

    Membership.prototype.removeSuccessMessage = function () {
        if (this.$successMessageElem) {
            this.$successMessageElem.remove();
            delete this.$successMessageElem;
        }
    };

    Membership.prototype.openFormAndUpdate = function () {
        var self = this;
        self.form.$cont.removeClass(self.getClass('ANIM_CLOSE', true) + ' ' + self.getClass('ANIM_CLOSED', true)).addClass(self.getClass('ANIM_OPEN', true));
        self.form.$button.addClass('membership-tab__update-button--muted')
            .text('Cancel');
    };

    Membership.prototype.closeFormAndUpdate = function () {
        var self = this;
        self.form.$cont.removeClass(self.getClass('ANIM_OPEN', true) + ' ' + self.getClass('ANIM_OPENED', true)).addClass(self.getClass('ANIM_CLOSE', true));
        self.form.$button.removeClass('membership-tab__update-button--muted')
            .text('Change card');
    };

    /** @override */
    Membership.prototype.ready = function () {
        var self = this;

        if (self.display) {

            self.addSpriteCss();

            $(self.getClass('TAB_BUTTON'), self.context).removeClass('is-hidden');
            $(self.getClass('TAB_CONTAINER'), self.context).removeClass('is-hidden');
            $('.js-account-profile-forms').addClass('identity-wrapper--with-membership');

            self.paymentForm = new PaymentForm().init(self.getElem('CC_CHANGE_FORM_CONT'), function (resp) {
                // hide form
                self.changeCCFormIsOpen = false;
                self.closeFormAndUpdate();

                // update cc last4 with new details
                $(self.getElem('CC_LAST4')).text(resp.last4);
                $(self.getElem('CC_TYPE')).removeClass(self.currentCardTypeClass);
                self.currentCardTypeClass = 'i-'+resp.cardType.toLowerCase().replace(' ', '-');
                $(self.getElem('CC_TYPE')).addClass(self.currentCardTypeClass);
                $(self.getElem('CC_NUM')).addClass('membership-tab__updated');
                // append a success message
                self.appendSuccessMessage(self.options.messages.CHANGE_CC_SUCCESS);
            });

            bean.on(self.getElem('CC_CHANGE_BUTTON'), 'click', function () {
                self.form = self.form || {
                    $cont: $(self.getClass('CC_CHANGE_FORM_CONT')),
                    $button: $(self.getClass('CC_CHANGE_BUTTON'), self.context)
                };

                if (!self.changeCCFormIsOpen) { // open
                    self.changeCCFormIsOpen = true;
                    self.openFormAndUpdate();
                    self.removeSuccessMessage();
                } else { // close
                    self.changeCCFormIsOpen = false;
                    self.closeFormAndUpdate();
                }
            });

            bean.on(self.getElem('CC_CHANGE_FORM_CONT'), 'animationend webkitAnimationEnd oanimationend MSAnimationEnd', function () {
                var $elem = $(this);
                if ($elem.hasClass(self.getClass('ANIM_OPEN', true))) {
                    $elem.removeClass(self.getClass('ANIM_OPEN', true) + ' ' + self.getClass('ANIM_CLOSE', true) + ' ' + self.getClass('ANIM_CLOSED', true)).addClass(self.getClass('ANIM_OPENED', true));
                } else {
                    $elem.removeClass(self.getClass('ANIM_CLOSE', true) + ' ' + self.getClass('ANIM_OPEN', true) + ' ' + self.getClass('ANIM_OPENED', true)).addClass(self.getClass('ANIM_CLOSED', true));
                }
            });

        }
    };

    return Membership;
});
