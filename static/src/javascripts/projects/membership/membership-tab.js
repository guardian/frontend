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

    function Membership(context, options) {

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
        NUM_CONTAINER: 'js-membership-number-container',
        NUM_TEXT: 'js-membership-number',
        CC_SUMMARY_LAST4: 'js-membership-summary-card-lastfour',
        CC_PAYMENT_LAST4: 'js-membership-payment-card-lastfour',
        CC_PAYMENT_TYPE: 'js-membership-payment-card-type',
        CC_PAYMENT_TYPE_TEXT: 'js-membership-payment-card-text',
        CC_CHANGE_BUTTON: 'js-membership-change-cc-open',
        CC_CHANGE_FORM_CONT: 'js-membership-change-cc-form-cont',
        CC_CHANGE_FORM: 'js-membership-change-cc-form',
        ANIM_OPEN: 'membership-tab__change-cc-form-cont--to-open',
        ANIM_OPENED: 'membership-tab__change-cc-form-cont--open',
        ANIM_CLOSE: 'membership-tab__change-cc-form-cont--to-closed',
        ANIM_CLOSED: 'membership-tab__change-cc-form-cont--closed',
        NOTIFICATION_TIER_CURRENT: 'js-mem-tier-current',
        NOTIFICATION_TIER_TARGET: 'js-mem-tier-target',
        NOTIFICATION_INTERVAL: 'js-mem-current-interval',
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
    Membership.prototype.endpoint = config.page.idUrl + '/membership.json';

    /**
    * @override
    * @type {string}
    */
    Membership.prototype.componentClass = 'js-membership-tab-container';

    Membership.prototype.formatDate = function (date) { // eg: 4th Jun 2014

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
            ],
            day = date.getDate(),
            month = months[date.getMonth()],
            year = date.getFullYear();

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
            memberOptIn,
            subscriptionIsCancelled,
            notificationCancelElement = self.getElem('NOTIFICATION_CANCEL'),
            notificationChangeElement = self.getElem('NOTIFICATION_CHANGE'),
            upperTabDetailsList = self.getClass('TAB_DETAILS_LIST_UPPER'),
            lowerTabDetailsList = self.getClass('TAB_DETAILS_LIST_LOWER'),
            membershipNumberContainer = self.getElem('NUM_CONTAINER'),
            membershipNumberElement = self.getElem('NUM_TEXT');

        ajax({
            url: config.page.membershipUrl + '/user/me/details',
            crossOrigin: true,
            withCredentials: true,
            method: 'get'
        }).then(function (resp) {
            var subscriptionDates = {
                currentPeriodStart: self.formatDate(new Date(resp.subscription.start)),
                currentPeriodEnd: self.formatDate(new Date(resp.subscription.end)),
                interval: resp.subscription.plan.interval === 'month' ? 'Monthly' : 'Annual'
            };
            memberOptIn = resp.optIn;
            subscriptionIsCancelled = !!resp.subscription.cancelledAt;

            // Display default tab contents
            self.display = true;
            $(self.getClass('TIER'), upperTabDetailsList).text(resp.subscription.plan.name);
            $(self.getClass('COST')).each(function () {
                this.innerHTML = self.formatAmount(resp.subscription.plan.amount);
            });
            $(self.getClass('JOIN'), upperTabDetailsList).text(self.formatDate(new Date(resp.joinDate)));

            if (resp.tier === 'Partner' || resp.tier === 'Patron') {

                if (subscriptionIsCancelled) {

                    if (memberOptIn) {
                        self.displayChangePackageTabContents.call(self, notificationChangeElement, resp, subscriptionDates);
                    } else {
                        self.displayCancellationTabContents.call(self, notificationCancelElement, resp, subscriptionDates);
                    }

                } else {
                    self.displayLowerTabContents.call(self, lowerTabDetailsList, resp, subscriptionDates);
                }
            }

            // this field is generated in batches so isn't available immediately after registering
            if (resp.regNumber) {
                $(membershipNumberContainer).removeClass('is-hidden');
                $(membershipNumberElement).text(resp.regNumber);
            }

            self.ready();
        });
    };

    /**
     * Display the tab contents for a downgraded membership
     *
     * @param rootElement String classname for the root
     * @param resp Object JSON response
     * @param subscriptionDates Object subscript relevant dates
     */
    Membership.prototype.displayChangePackageTabContents = function (rootElement, resp, subscriptionDates) {
        var subscriptionNewStartDate = this.formatDate(
            new Date(
                    new Date(resp.subscription.end).getTime() + (24 * 60 * 60 * 1000)
            )
        );
        $(this.getClass('TAB_DETAILS_LIST_UPPER'), this.context).addClass('is-hidden');
        $(rootElement, this.context).removeClass('is-hidden');
        $(this.getClass('NOTIFICATION_TIER_CURRENT'), rootElement).html(resp.tier);
        $(this.getClass('NOTIFICATION_TIER_TARGET'), rootElement).html('Friend');
        $(this.getClass('NOTIFICATION_INTERVAL'), rootElement).html(subscriptionDates.interval);
        $(this.getClass('NOTIFICATION_PERIOD_START'), rootElement).html(subscriptionDates.currentPeriodStart);
        $(this.getClass('NOTIFICATION_PERIOD_END'), rootElement).html(subscriptionDates.currentPeriodEnd);
        $(this.getClass('NOTIFICATION_NEW_START'), rootElement).html(subscriptionNewStartDate);
        $(this.getClass('NOTIFICATION_ICON_CURRENT'), rootElement).addClass('i-g-' + resp.tier.toLowerCase());
        $(this.getClass('NOTIFICATION_ICON_TARGET'), rootElement).addClass('i-g-' + 'friend');
        $(this.getClass('CC_SUMMARY_LAST4'), rootElement).text(resp.subscription.card.last4);
    };

    /**
     * Display the tab contents for a cancelled membership
     *
     * @param rootElement String classname for the root
     * @param resp Object JSON response
     * @param subscriptionDates Object subscript relevant dates
     */
    Membership.prototype.displayCancellationTabContents = function (rootElement, resp, subscriptionDates) {
        $(this.getClass('TAB_DETAILS_LIST_UPPER'), this.context).addClass('is-hidden');
        $(rootElement, this.context).removeClass('is-hidden');
        $(this.getClass('NOTIFICATION_TIER'), rootElement).html(resp.tier);
        $(this.getClass('NOTIFICATION_PERIOD_START'), rootElement).html(subscriptionDates.currentPeriodStart);
        $(this.getClass('NOTIFICATION_PERIOD_END'), rootElement).html(subscriptionDates.currentPeriodEnd);
    };

    /**
     * Display the contents of the lower tab for subscribed members
     *
     * @param rootElement String classname for the root
     * @param resp Object JSON response
     * @param subscriptionDates Object subscript relevant dates
     */
    Membership.prototype.displayLowerTabContents = function (rootElement, resp, subscriptionDates) {
        $(rootElement, this.context).removeClass('is-hidden');
        $(this.getClass('INTERVAL'), this.context).html(subscriptionDates.interval);
        $(this.getClass('NEXT'), rootElement).text(this.formatDate(new Date(resp.subscription.end)));
        $(this.getClass('CC_PAYMENT_LAST4'), rootElement).text(resp.subscription.card.last4);

        this.currentCardTypeClass = 'i-' + resp.subscription.card.type.toLowerCase().replace(' ', '-');

        $(this.getClass('CC_PAYMENT_TYPE'), rootElement).addClass(this.currentCardTypeClass);
        $(this.getClass('CC_PAYMENT_TYPE_TEXT'), rootElement).text(resp.subscription.card.type);
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
                $(self.getElem('CC_PAYMENT_LAST4')).text(resp.last4);
                $(self.getElem('CC_PAYMENT_TYPE')).removeClass(self.currentCardTypeClass);
                self.currentCardTypeClass = 'i-' + resp.cardType.toLowerCase().replace(' ', '-');
                $(self.getElem('CC_PAYMENT_TYPE')).addClass(self.currentCardTypeClass);
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
