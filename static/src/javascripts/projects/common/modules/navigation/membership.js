import userFeatures from 'commercial/modules/user-features';
import fastdom from 'lib/fastdom-promise';
import $ from 'lib/$';
const LAST_CLASS = 'brand-bar__item--split--last';

function init() {
    if (userFeatures.isPayingMember()) {
        const $becomeMemberLink = $('.js-become-member');
        const $subscriberLink = $('.js-subscribe');
        fastdom.write(() => {
            $becomeMemberLink.attr('hidden', 'hidden');
            $subscriberLink.removeClass(LAST_CLASS);
        });
    }
}

export default init;
