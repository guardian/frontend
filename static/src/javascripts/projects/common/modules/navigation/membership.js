// @flow

import { isPayingMember } from 'commercial/modules/user-features';
import fastdom from 'lib/fastdom-promise';

const initMembership = (): void => {
    if (isPayingMember()) {
        const becomeMemberLink = document.getElementsByClassName(
            'js-become-member'
        )[0];
        const subscriberLink = document.getElementsByClassName(
            'js-subscribe'
        )[0];

        fastdom.write(() => {
            if (becomeMemberLink) {
                becomeMemberLink.setAttribute('hidden', 'hidden');
            }
            if (subscriberLink) {
                subscriberLink.classList.remove('brand-bar__item--split--last');
            }
        });
    }
};

export { initMembership };
