import userFeatures from 'commercial/modules/user-features';
import fastdom from 'lib/fastdom-promise';
import $ from 'lib/$';
var LAST_CLASS = 'brand-bar__item--split--last';

function init() {
    if (userFeatures.isPayingMember()) {
        var $becomeMemberLink = $('.js-become-member');
        var $subscriberLink = $('.js-subscribe');
        fastdom.write(function() {
            $becomeMemberLink.attr('hidden', 'hidden');
            $subscriberLink.removeClass(LAST_CLASS);
        });
    }
}

export default init;
