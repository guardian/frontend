/*
* If user is a member, display a membership tab on edit profile page
*/
define(['common/utils/$',
'bean',
'bonzo',
'common/utils/ajax',
'common/utils/config',
'common/modules/component',
'membership/paymentForm'], function ($, bean, bonzo, ajax, config, Component, PaymentForm) {

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
        TIER: 'js-membership-tier',
        COST: 'js-membership-payment-cost',
        START: 'js-membership-start-date',
        NEXT: 'js-membership-payment-next',
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
        ANIM_CLOSED: 'membership-tab__change-cc-form-cont--closed'
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
    *    If the user is a guardian member; Render the contents of the membership
    *    tab using the response from the /user/me
    */
    Membership.prototype.prerender = function () {
        var self = this;

        ajax({
            url: config.page.membershipUrl + '/user/me/details',
            crossOrigin: true,
            withCredentials: true,
            method: 'get'
        }).then(function (resp) {
            if (resp.tier === 'Partner' || resp.tier === 'Patron') {
                self.display = true;
                self.getElem('TIER').innerHTML = resp.subscription.plan.name;
                self.getElem('COST').innerHTML = (resp.subscription.plan.amount / 100).toFixed(2);
                self.getElem('START').innerHTML = self.formatDate(new Date(resp.subscription.start * 1000));
                self.getElem('NEXT').innerHTML = self.formatDate(new Date(resp.subscription.end * 1000));
                self.getElem('CC_LAST4').innerHTML = resp.subscription.card.last4;

                self.currentCardTypeClass = 'i-' + resp.subscription.card.type.toLowerCase().replace(' ', '-');
                $(self.getElem('CC_TYPE')).addClass(self.currentCardTypeClass);
                self.getElem('CC_TYPE_TEXT').innerHTML = resp.subscription.card.type; // Append text too for screen readers
            }

            self.ready();
        }, function () {
            self.getElem('TIER').innerHTML = 'Tier not currently available';
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
            this.$successMessageElem = bonzo(bonzo.create('<div>')).addClass('form__success').text(message).prependTo(this.getClass('TAB_CONTAINER'));
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
            .text('Change');
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
                var $elem = bonzo(this);
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
