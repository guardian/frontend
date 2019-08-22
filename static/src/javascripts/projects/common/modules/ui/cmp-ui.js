// @flow
import { getCookie } from 'lib/cookies';

// TODO: this should be derived from config
const CMP_DOMAIN = 'https://manage.theguardian.com';
const CMP_URL = `${CMP_DOMAIN}/consent`;
const CMP_CLOSE_MSG = 'closeCmp';
const IAB_COOKIE_NAME = 'euconsent';

let container: ?HTMLElement;

const receiveMessage = (event: MessageEvent) => {
    const { origin, data } = event;

    if (
        origin === CMP_DOMAIN &&
        data === CMP_CLOSE_MSG &&
        container &&
        container.parentNode
    ) {
        container.remove();
    }
};

const addContainerToPage = (): void => {
    if (document.body && container && !container.parentElement) {
        document.body.appendChild(container);
    }
};

const handlePrivacySettingsClick = (evt: Event): void => {
    evt.preventDefault();

    addContainerToPage();
};

const addPrivacySettingsLink = (): void => {
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

export const init = (): void => {
    if (getCookie(IAB_COOKIE_NAME)) {
        return;
    }

    container = document.createElement('div');
    container.className = 'cmp-overlay';

    const iframe = document.createElement('iframe');
    iframe.src = CMP_URL;
    iframe.className = 'cmp-iframe';

    container.appendChild(iframe);

    addContainerToPage();

    /**
     * Temporarily add a Privacy Settings
     * link in the footer for resurfacing the CMP UI.
     * */
    addPrivacySettingsLink();

    window.addEventListener('message', receiveMessage, false);
};
