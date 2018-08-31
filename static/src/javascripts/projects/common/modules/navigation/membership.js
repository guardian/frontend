// @flow

import {
    isPayingMember,
    accountDataUpdateWarning,
} from 'common/modules/commercial/user-features';
import fastdom from 'lib/fastdom-promise';
import { Message } from 'common/modules/ui/message';
import config from 'lib/config';
import bean from 'bean';
import arrowRight from 'svgs/icon/arrow-right.svg';
import type { Banner } from 'common/modules/ui/bannerPicker';
import userPrefs from 'common/modules/user-prefs';

const accountDataUpdateLink = accountDataUpdateWarningLink =>
    `${config.get('page.idUrl')}/${
        accountDataUpdateWarningLink === 'contribution'
            ? 'contribution/recurring/edit'
            : `${accountDataUpdateWarningLink}/edit`
    }`;

const messageCode: string = 'membership-action-required';

const bannerCanBeLoadedAgainAfterKey: string =
    'mmaActionRequiredBannerCanBeShownAgainAfter';

const storeBannerCanBeLoadedAgainAfter = () => {
    const thisTimeTomorrow = new Date();
    thisTimeTomorrow.setDate(thisTimeTomorrow.getDate() + 1);
    userPrefs.set(
        bannerCanBeLoadedAgainAfterKey,
        thisTimeTomorrow.toISOString()
    );
};

const showAccountDataUpdateWarningMessage = accountDataUpdateWarningLink => {
    const gaTracker = config.get('googleAnalytics.trackers.editorial');
    const newMessage = new Message(messageCode, {
        cssModifierClass: messageCode,
        trackDisplay: true,
        siteMessageLinkName: messageCode,
        siteMessageComponentName: messageCode,
        customJs: () => {
            bean.on(document, 'click', '.js-site-message-close', () => {
                window.ga(
                    `${gaTracker}.send`,
                    'event',
                    'click',
                    'in page',
                    'membership action required | banner hidden'
                );
                storeBannerCanBeLoadedAgainAfter();
            });

            bean.on(document, 'click', '.js-mma-update-details-button', () => {
                window.ga(
                    `${gaTracker}.send`,
                    'event',
                    'click',
                    'in page',
                    'membership action required | banner update details clicked'
                );
                storeBannerCanBeLoadedAgainAfter();
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
        `<span class="site-message__copy-text">
            An action is needed on your Guardian account. 
            Please review and update your details as soon as you can. Thank you.
        </span>
        <a class="button site-message__copy-button js-mma-update-details-button" href="${accountDataUpdateLink(
            accountDataUpdateWarningLink
        )}">
            Update details ${arrowRight.markup}
        </a>`
    );
};
const updateLink = accountDataUpdateWarning();

const canShow: () => Promise<boolean> = () => {
    const bannerCanBeLoadedAgainAfter = userPrefs.get(
        bannerCanBeLoadedAgainAfterKey
    );
    return Promise.resolve(
        updateLink !== null &&
            !(
                bannerCanBeLoadedAgainAfter &&
                new Date(bannerCanBeLoadedAgainAfter) > new Date()
            )
    );
};

const show: () => Promise<boolean> = () => {
    if (updateLink) {
        showAccountDataUpdateWarningMessage(updateLink);
        return Promise.resolve(true);
    }

    return Promise.resolve(false);
};

export const membershipBanner: Banner = {
    id: messageCode,
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
