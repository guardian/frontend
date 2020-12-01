import { cmp } from '@guardian/consent-management-platform';
import type { Banner } from 'common/modules/ui/bannerPicker';
import config from 'lib/config';
import { getPrivacyFramework } from 'lib/getPrivacyFramework';

export const addPrivacySettingsLink = (): void => {
    if (!config.get('switches.consentManagement', true)) {
        return;
    }

    const privacyLink: HTMLElement | null | undefined = document.querySelector(
        'a[data-link-name=privacy]'
    );

    if (privacyLink) {
        const privacyLinkListItem: Element | null | undefined =
            privacyLink.parentElement;

        if (privacyLinkListItem) {
            const newPrivacyLink: HTMLElement = privacyLink.cloneNode(false);

            newPrivacyLink.dataset.linkName = 'privacy-settings';
            newPrivacyLink.removeAttribute('href');
            newPrivacyLink.innerText = getPrivacyFramework().ccpa
                ? 'California resident – Do Not Sell'
                : 'Privacy settings';

            const newPrivacyLinkListItem: Element = privacyLinkListItem.cloneNode(
                false
            );

            newPrivacyLinkListItem.appendChild(newPrivacyLink);

            privacyLinkListItem.insertAdjacentElement(
                'beforebegin',
                newPrivacyLinkListItem
            );

            newPrivacyLink.addEventListener('click', () => {
                cmp.showPrivacyManager();
            });
        }
    }
};

export const cmpBannerCandidate: Banner = {
    id: 'cmpUi',
    canShow: (): Promise<boolean> => {
        if (!config.get('switches.cmp', true)) return Promise.resolve(false);
        return cmp.willShowPrivacyMessage();
    },
    // Remote banner is injected first: show() always resolves to `true`
    show: (): Promise<boolean> => Promise.resolve(true),
};
