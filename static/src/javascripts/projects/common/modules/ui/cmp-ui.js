// @flow

// TODO: this should be derived from config
const CMP_DOMAIN = 'https://manage.theguardian.com';
const CMP_URL = `${CMP_DOMAIN}/consent`;

let container: ?HTMLElement;

const receiveMessage = (event: MessageEvent) => {
    if (event.origin === CMP_DOMAIN && container && container.parentNode) {
        container.remove();
    }
};

export const init = (): void => {
    container = document.createElement('div');
    container.className = 'cmp-overlay';

    const iframe = document.createElement('iframe');
    iframe.src = CMP_URL;
    iframe.className = 'cmp-iframe';

    container.appendChild(iframe);

    if (document.body) {
        document.body.appendChild(container);
    }

    window.addEventListener('message', receiveMessage, false);
};
