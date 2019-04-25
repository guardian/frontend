// @flow

import {
    isPayingMember,
    accountDataUpdateWarning,
    getLastOneOffContributionDate,
    getLastRecurringContributionDate,
} from 'common/modules/commercial/user-features';
import fastdom from 'lib/fastdom-promise';
import { Message } from 'common/modules/ui/message';
import config from 'lib/config';
import bean from 'bean';
import arrowRight from 'svgs/icon/arrow-right.svg';
import type { Banner } from 'common/modules/ui/bannerPicker';
import { isUserLoggedIn } from 'common/modules/identity/api';
import userPrefs from 'common/modules/user-prefs';
import { submitViewEvent } from 'common/modules/commercial/acquisitions-ophan';

const createManageBannerLink = manageProductKeyword =>
    `${config.get('page.mmaUrl')}/banner/${manageProductKeyword}?INTCMP=BANNER`;

const accountDataUpdateLink = accountDataUpdateWarningLink => {
    switch (accountDataUpdateWarningLink) {
        case 'contribution':
            return createManageBannerLink('contributions');
        case 'membership':
        case 'digitalpack':
            return createManageBannerLink(accountDataUpdateWarningLink);
        default:
            return `${config.get(
                'page.idUrl'
            )}/${accountDataUpdateWarningLink}/edit`;
    }
};

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

const gaTrackMMA = (category, action) => label => {
    window.ga(
        `${config.get('googleAnalytics.trackers.editorial')}.send`,
        'event',
        category,
        action,
        label
    );
};

const updateLink = accountDataUpdateWarning();

const showAccountDataUpdateWarningMessage = accountDataUpdateWarningLink => {
    const newMessage = new Message(messageCode, {
        cssModifierClass: messageCode,
        trackDisplay: true,
        siteMessageLinkName: messageCode,
        siteMessageComponentName: messageCode,
        customJs: () => {
            const gaTrackClickMMA = gaTrackMMA('click', 'in page');
            const gaTrackElementViewMMA = gaTrackMMA(
                'element view',
                'internal'
            );

            bean.on(document, 'click', '.js-site-message-close', () => {
                gaTrackClickMMA('membership action required | banner hidden');
                gaTrackClickMMA(
                    `mma action required | banner hidden | ${updateLink || '?'}`
                );
                storeBannerCanBeLoadedAgainAfter();
            });

            bean.on(document, 'click', '.js-mma-update-details-button', () => {
                gaTrackClickMMA(
                    'membership action required | banner update details clicked'
                );
                gaTrackClickMMA(
                    `mma action required | banner update details clicked | ${updateLink ||
                        '?'}`
                );
                storeBannerCanBeLoadedAgainAfter();
            });

            gaTrackElementViewMMA(
                'membership action required | banner impression'
            );
            gaTrackElementViewMMA(
                `mma action required | banner impression | ${updateLink || '?'}`
            );
        },
    });

    newMessage.show(
        `<div class="site-message__copy-heading">
            Action is needed on your Guardian account
        </div>
        <div class="site-message__copy-text">
            Please review and update your details as&nbsp;soon&nbsp;as&nbsp;you&nbsp;can. Thank&nbsp;you.
        </div>
        <div class="site-message__copy-text">
            <a class="button site-message__copy-button js-mma-update-details-button" href="${accountDataUpdateLink(
                accountDataUpdateWarningLink
            )}">
                Update details ${arrowRight.markup}
            </a>
        </div>`
    );
};

const canShow: () => Promise<boolean> = () => {
    const bannerCanBeLoadedAgainAfter = userPrefs.get(
        bannerCanBeLoadedAgainAfterKey
    );
    return Promise.resolve(
        updateLink !== null &&
            isUserLoggedIn() &&
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
    const lastOneOff = getLastOneOffContributionDate();
    const lastRecurring = getLastRecurringContributionDate();

    if (lastOneOff) {
        submitViewEvent({
            component: {
                componentType: 'ACQUISITIONS_OTHER',
                id: 'acquisitions-cookie-one-off',
            },
            value: lastOneOff.toString(),
        });
    }

    if (lastRecurring) {
        submitViewEvent({
            component: {
                componentType: 'ACQUISITIONS_OTHER',
                id: 'acquisitions-cookie-recurring',
            },
            value: lastRecurring.toString(),
        });
    }

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
