// @flow
const CMP_URL = 'https://manage.thegulocal.com/consent';

export const init = (): void => {
    const container = document.createElement('div');
    container.className = 'cmp-overlay';
    const iframe = document.createElement('iframe');
    iframe.src = CMP_URL;
    iframe.className = 'cmp-iframe';

    container.appendChild(iframe);

    if (document.body) {
        document.body.appendChild(container);
    }
};
