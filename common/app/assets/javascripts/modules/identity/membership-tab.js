/*
* If user is a member, display a membership tab on edit profile page
*/
define(['common/$',
'common/utils/ajax',
'common/utils/config',
'common/modules/component',], function ($, ajax, config, Component) {

    function Membership (context, mediator, options) {

        this.context = context || document;
        this.mediator = mediator;
        this.setOptions(options);
    };

    Component.define(Membership);

    Membership.prototype.classes = {
        TAB_BUTTON: 'js-memebership-tab-button',
        TAB_CONTAINER: 'js-memebership-tab-container',
        TIER: 'js-membership-tier',
        COST: 'js-membership-payment-cost',
        START: 'js-membership-start-date',
        NEXT: 'js-membership-payment-next',
        CC_LAST4: 'js-membership-card-lastfour',
        CC_TYPE: 'js-membership-card-type'
    };

    /**
    * @type {string}
    * @override
    */
    Membership.prototype.endpoint = '/membership.json';

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

        function ordinal (d) {
            if(date > 20 || date < 10) {
                switch(date%10) {
                case 1:
                    return d+"st";
                case 2:
                    return d+"nd";
                case 3:
                    return d+"rd";
                }
            }
            return d+"th";
        }

        var day = ordinal(date.getDate());
        var month = months[date.getMonth()];
        var year = date.getFullYear();

        return day + " " + month + " " + year;
    };

    /**
    *    If the user is a guardian member; Render the contents of the membership
    *    tab using the response from the /user/me
    */
    Membership.prototype.prerender = function () {
        var self = this;

        ajax({
            url: 'https://mem.thegulocal.com/user/me/details',
            crossOrigin: true,
            withCredentials: true,
            method: 'get'
        }).then(function (resp) {
            if (resp.tier == 'Partner' || resp.tier == 'Patron') { self.display = true; }
            self.getElem('TIER').innerHTML = resp.subscription.plan.name;
            self.getElem('COST').innerHTML = (resp.subscription.plan.amount/100).toFixed(2);
            self.getElem('START').innerHTML = self.formatDate(new Date(resp.subscription.start*1000));
            self.getElem('NEXT').innerHTML = self.formatDate(new Date(resp.subscription.end*1000));
            self.getElem('CC_LAST4').innerHTML = resp.subscription.card.last4;

            $(self.getElem('CC_TYPE')).addClass('i-'+resp.subscription.card.type.toLowerCase().replace(' ', '-'));
            self.getElem('CC_TYPE').innerHTML = resp.subscription.card.type; // Append text too for screen readers

            self.ready();
        }, function () {
            self.getElem('TIER').innerHTML = 'Tier not currently available';
            self.ready();
        });

    };

    /** @override */
    Membership.prototype.ready = function () {
        if (this.display) {
            $(this.context.querySelector(this.getClass('TAB_BUTTON'))).removeClass('is-hidden');
            $(this.context.querySelector(this.getClass('TAB_CONTAINER'))).removeClass('is-hidden');
            $(this.context.querySelector('.js-account-profile-forms')).addClass('with-membership');
        }
    };

    return Membership;
});
