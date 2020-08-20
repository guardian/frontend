// @flow
import config from 'lib/config';
import raven from 'lib/raven';
import { cmp } from '@guardian/consent-management-platform';
import { getPrivacyFramework } from 'lib/getPrivacyFramework';

let initUi;

export const show = (forceModal: ?boolean): Promise<boolean> => {
    if (initUi) {
        initUi();
    } else {
        require.ensure(
            [],
            () => {
                initUi = raven.context(
                    {
                        tags: {
                            feature: 'cmp',
                        },
                    },
                    () => {
                        if (forceModal) {
                            cmp.showPrivacyManager();
                        }
                    },
                    []
                );
            },
            'cmp'
        );
    }

    return Promise.resolve(true);
};

export const addPrivacySettingsLink = (): void => {
    if (!config.get('switches.cmpUi', true)) {
        return;
    }

    const privacyLink: ?HTMLElement = document.querySelector(
        'a[data-link-name=privacy]'
    );

    if (privacyLink) {
        const privacyLinkListItem: ?Element = privacyLink.parentElement;

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
                show(true);
            });
        }
    }
};

export const consentManagementPlatformUi = {
    id: 'cmpUi',
    canShow: (): Promise<boolean> => {
        if (!config.get('switches.cmp', true)) return Promise.resolve(false);
        return Promise.resolve(cmp.willShowPrivacyMessage());
    },
    show,
};
