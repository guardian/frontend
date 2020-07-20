// @flow
import config from 'lib/config';
import raven from 'lib/raven';
import { cmp, oldCmp } from '@guardian/consent-management-platform';
import { isInUsa } from 'common/modules/commercial/geo-utils';
import { isInTcfv2Test } from 'commercial/modules/cmp/tcfv2-test';

let initUi;

export const show = (forceModal: ?boolean): Promise<boolean> => {
    if (initUi) {
        initUi();
    } else {
        require.ensure(
            [],
            require => {
                initUi = raven.context(
                    {
                        tags: {
                            feature: 'cmp',
                        },
                    },
                    () => {
                        if (isInUsa() || isInTcfv2Test()) {
                            if (forceModal) {
                                cmp.showPrivacyManager();
                            }
                        } else {
                            require('common/modules/cmp-ui').init(!!forceModal);
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
            newPrivacyLink.innerText = isInUsa()
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
        if (isInUsa() || isInTcfv2Test()) {
            return Promise.resolve(cmp.willShowPrivacyMessage());
        }
        return Promise.resolve(
            config.get('switches.cmpUi', true) && oldCmp.shouldShow()
        );
    },
    show,
};
