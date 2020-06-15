// @flow
import config from 'lib/config';
import {
    shouldShow,
    checkWillShowUi,
    showPrivacyManager,
} from '@guardian/consent-management-platform';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { ccpaCmpTest } from 'common/modules/experiments/tests/cmp-ccpa-test';
import raven from 'lib/raven';

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
                        if (isInVariantSynchronous(ccpaCmpTest, 'variant')) {
                            showPrivacyManager();
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
            newPrivacyLink.innerText = 'Privacy settings';

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
        if (isInVariantSynchronous(ccpaCmpTest, 'variant')) {
            return checkWillShowUi();
        }
        return Promise.resolve(
            config.get('switches.cmpUi', true) && shouldShow()
        );
    },

    show,
};
