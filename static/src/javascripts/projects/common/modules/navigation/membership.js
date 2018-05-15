// @flow

import {
    isPayingMember,
    accountDataUpdateWarning,
} from 'common/modules/commercial/user-features';
import fastdom from 'lib/fastdom-promise';
import { Message } from 'common/modules/ui/message';
import config from 'lib/config';
import bean from 'bean';
import type { Banner } from 'common/modules/ui/bannerPicker';

const accountDataUpdateLink = accountDataUpdateWarningLink =>
    `${config.get('page.idUrl')}/${
        accountDataUpdateWarningLink === 'contribution'
            ? 'contribution/recurring/edit'
            : `${accountDataUpdateWarningLink}/edit`
    }`;

const showAccountDataUpdateWarningMessage = accountDataUpdateWarningLink => {
    const gaTracker = config.get('googleAnalytics.trackers.editorial');
    const newMessage = new Message('membership-action-required', {
        cssModifierClass: 'membership-action-required',
        trackDisplay: true,
        siteMessageLinkName: 'membership-action-required',
        siteMessageComponentName: 'membership-action-required',
        customJs: () => {
            bean.on(document, 'click', '.js-site-message-close', () => {
                window.ga(
                    `${gaTracker}.send`,
                    'event',
                    'click',
                    'in page',
                    'membership action required | banner hidden'
                );
            });

            window.ga(
                `${gaTracker}.send`,
                'event',
                'element view',
                'internal',
                'membership action required | banner impression'
            );
        },
    });
    newMessage.show(
        `An action is needed on your Guardian account. Please <a href='${accountDataUpdateLink(
            accountDataUpdateWarningLink
        )}'>update your details</a>`
    );
};
const updateLink = accountDataUpdateWarning();

const canShow: () => Promise<boolean> = () =>
    Promise.resolve(updateLink !== null);

const show: () => void = () => {
    if (updateLink) {
        showAccountDataUpdateWarningMessage(updateLink);
    }
};

export const membershipBanner: Banner = {
    id: 'membership-action-required',
    show,
    canShow,
};

export const initMembership = (): void => {
    if (isPayingMember()) {
        fastdom
            .read(() => document.getElementsByClassName('js-become-member'))
            .then(becomeMemberLinks => {
                if (becomeMemberLinks.length) {
                    becomeMemberLinks[0].setAttribute('hidden', 'hidden');
                }
            });

        fastdom
            .read(() => document.getElementsByClassName('js-subscribe'))
            .then(subscriberLinks => {
                if (subscriberLinks.length) {
                    subscriberLinks[0].classList.remove(
                        'brand-bar__item--split--last'
                    );
                }
            });
    }
};
