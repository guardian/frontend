// @flow
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { commercialCmpUiIab } from 'common/modules/experiments/tests/commercial-cmp-ui-iab';
import { shouldShow } from '@guardian/consent-management-platform';
import raven from 'lib/raven';

let initUi;

const show = (forceModal: ?boolean): Promise<boolean> => {
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
                        require('common/modules/cmp-ui').init(!!forceModal);
                    },
                    []
                );
            },
            'cmp'
        );
    }

    return Promise.resolve(true);
};

export const isInCmpTest = (): boolean =>
    isInVariantSynchronous(commercialCmpUiIab, 'variant');

export const addPrivacySettingsLink = (): void => {
    if (!isInCmpTest()) {
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
        if (isInCmpTest()) {
            return Promise.resolve(shouldShow());
        }

        return Promise.resolve(false);
    },
    show,
};
