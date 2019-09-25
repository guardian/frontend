// @flow
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { commercialIabCompliant } from 'common/modules/experiments/tests/commercial-iab-compliant';
import { cmpConfig, cmpUi } from '@guardian/consent-management-platform';
import fastdom from 'lib/fastdom-promise';

const CMP_READY_CLASS = 'cmp-iframe-ready';
const CMP_ANIMATE_CLASS = 'cmp-iframe-animate';
const OVERLAY_CLASS = 'cmp-overlay';
const IFRAME_CLASS = 'cmp-iframe';
let container: ?HTMLElement;
let uiPrepared: boolean = false;

const animateCmp = (): Promise<void> =>
    new Promise(resolve => {
        /**
         * Adding CMP_READY_CLASS changes display: none to display: block
         * on the overlay. You can't update this display property and transition
         * other properties of the container or the iframe in a single step because the display
         * property overrides the transitions. We therefore have this short setTimeout
         * before adding CMP_ANIMATE_CLASS to transition the overlay opacity and the iframe position.
         */
        setTimeout(() => {
            fastdom.write(() => {
                if (container && container.parentNode) {
                    container.classList.add(CMP_ANIMATE_CLASS);

                    // disable scrolling on body beneath overlay
                    if (document.body) {
                        document.body.classList.add('no-scroll');
                    }

                    resolve();
                }
            });
        }, 0);
    });

const onReadyCmp = (): Promise<void> =>
    fastdom
        .write(() => {
            if (container && container.parentNode) {
                container.classList.add(CMP_READY_CLASS);
            }
        })
        .then(animateCmp);

const removeCmp = (): Promise<void> =>
    /**
     *  Wait for transition duration (500ms)
     *  to end before removing container
     */
    new Promise(resolve => {
        setTimeout(() => {
            fastdom
                .write(() => {
                    if (container && container.parentNode) {
                        container.remove();
                        container.classList.remove(CMP_READY_CLASS);
                    }
                })
                .then(resolve);
        }, 500);
    });

const onCloseCmp = (): Promise<void> =>
    fastdom
        .write(() => {
            if (container && container.parentNode) {
                // enable scrolling on body beneath overlay
                if (document.body) {
                    document.body.classList.remove('no-scroll');
                }

                container.classList.remove(CMP_ANIMATE_CLASS);
            }
        })
        .then(removeCmp);

const prepareUi = (): void => {
    if (uiPrepared) {
        return;
    }

    container = document.createElement('div');
    container.className = OVERLAY_CLASS;

    const iframe = document.createElement('iframe');
    iframe.src = cmpConfig.CMP_URL;
    iframe.className = IFRAME_CLASS;
    iframe.tabIndex = 1;

    container.appendChild(iframe);

    cmpUi.setupMessageHandlers(onReadyCmp, onCloseCmp);

    uiPrepared = true;
};

const show = (): Promise<boolean> => {
    prepareUi();

    if (document.body && container && !container.parentElement) {
        document.body.appendChild(container);
    }

    return Promise.resolve(true);
};

const handlePrivacySettingsClick = (evt: Event): void => {
    evt.preventDefault();

    show();
};

export const addPrivacySettingsLink = (): void => {
    if (!isInVariantSynchronous(commercialIabCompliant, 'variant')) {
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
                'afterend',
                newPrivacyLinkListItem
            );

            newPrivacyLink.addEventListener(
                'click',
                handlePrivacySettingsClick
            );
        }
    }
};

export const consentManagementPlatformUi = {
    id: 'cmpUi',
    canShow: (): Promise<boolean> => {
        if (isInVariantSynchronous(commercialIabCompliant, 'variant')) {
            return Promise.resolve(cmpUi.canShow());
        }

        return Promise.resolve(false);
    },
    show,
};

// Exposed for testing purposes only
export const _ = {
    reset: (): void => {
        if (container) {
            if (container.parentNode) {
                container.remove();
            }
            container = undefined;
        }
        uiPrepared = false;
    },
    CMP_READY_CLASS,
    CMP_ANIMATE_CLASS,
    OVERLAY_CLASS,
    IFRAME_CLASS,
    onReadyCmp,
    onCloseCmp,
};
