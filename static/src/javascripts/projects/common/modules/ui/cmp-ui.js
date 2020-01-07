// @flow
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { commercialCmpUiIab } from 'common/modules/experiments/tests/commercial-cmp-ui-iab';
import { cmpConfig, cmpUi } from '@guardian/consent-management-platform';
import fastdom from 'lib/fastdom-promise';
import reportError from 'lib/report-error';

const CMP_READY_CLASS = 'cmp-iframe-ready';
const CMP_ANIMATE_CLASS = 'cmp-animate';
const OVERLAY_CLASS = 'cmp-overlay';
const IFRAME_CLASS = 'cmp-iframe';
const CONTAINER_CLASS = 'cmp-container';
let overlay: ?HTMLElement;
let uiPrepared: boolean = false;

const animateCmp = (): Promise<void> =>
    new Promise(resolve => {
        /**
         * Adding CMP_READY_CLASS changes display: none to display: block
         * on the overlay. You can't update this display property and transition
         * other properties of the overlay or the iframe in a single step because the display
         * property overrides the transitions. We therefore have this short setTimeout
         * before adding CMP_ANIMATE_CLASS to transition the overlay opacity and the iframe position.
         */
        setTimeout(() => {
            fastdom.write(() => {
                if (overlay && overlay.parentNode) {
                    overlay.classList.add(CMP_ANIMATE_CLASS);
                    resolve();
                }
            });
        }, 0);
    });

const onReadyCmp = (): Promise<void> =>
    fastdom
        .write(() => {
            if (overlay && overlay.parentNode) {
                overlay.classList.add(CMP_READY_CLASS);
            }
        })
        .then(animateCmp);

const removeCmp = (): Promise<void> =>
    /**
     *  Wait for transition duration (600ms)
     *  to end before removing overlay
     */
    new Promise(resolve => {
        setTimeout(() => {
            fastdom
                .write(() => {
                    if (overlay && overlay.parentNode) {
                        overlay.remove();
                        overlay.classList.remove(CMP_READY_CLASS);
                    }
                })
                .then(resolve);
        }, 600);
    });

const onCloseCmp = (): Promise<void> =>
    fastdom
        .write(() => {
            if (overlay && overlay.parentNode) {
                overlay.classList.remove(CMP_ANIMATE_CLASS);
            }
        })
        .then(removeCmp);

const onErrorCmp = (error: Error): void => {
    reportError(
        error,
        {
            feature: 'cmp',
        },
        false
    );
};

const getUrl = (): string => {
    if (isInVariantSynchronous(commercialCmpUiIab, 'variant')) {
        return `${cmpConfig.CMP_URL}?abTestVariant=CmpUiIab-variant`;
    }

    return cmpConfig.CMP_URL;
};

const prepareUi = (): void => {
    if (uiPrepared) {
        return;
    }

    overlay = document.createElement('div');
    overlay.className = OVERLAY_CLASS;

    const container: HTMLElement = document.createElement('div');
    container.className = CONTAINER_CLASS;

    /**
     * We found a bug where scrolling was
     * sometimes not picked up on the iframe once it had animated in.
     * Only forcing a reflow would correct this, so now when
     * on the container transitionend we force a reflow.
     */
    container.addEventListener('transitionend', () => {
        fastdom.write(() => {
            if (overlay && overlay.parentNode) {
                overlay.style.width = '100%';
            }
        });
    });

    overlay.appendChild(container);

    const iframe: HTMLIFrameElement = document.createElement('iframe');

    iframe.className = IFRAME_CLASS;

    iframe.src = getUrl();

    iframe.tabIndex = 1;
    iframe.addEventListener(
        'touchmove',
        (evt: Event) => {
            evt.preventDefault();
        },
        false
    );

    container.appendChild(iframe);

    cmpUi.setupMessageHandlers(onReadyCmp, onCloseCmp, onErrorCmp);

    uiPrepared = true;
};

const show = (): Promise<boolean> => {
    prepareUi();

    if (document.body && overlay && !overlay.parentElement) {
        document.body.appendChild(overlay);
    }

    return Promise.resolve(true);
};

const handlePrivacySettingsClick = (evt: Event): void => {
    evt.preventDefault();

    show();
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
        if (isInCmpTest()) {
            return Promise.resolve(cmpUi.canShow());
        }

        return Promise.resolve(false);
    },
    show,
};

// Exposed for testing purposes only
export const _ = {
    reset: (): void => {
        if (overlay) {
            if (overlay.parentNode) {
                overlay.remove();
            }
            overlay = undefined;
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
