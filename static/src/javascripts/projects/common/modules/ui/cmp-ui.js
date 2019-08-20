// @flow
const CMP_URL = 'https://manage.thegulocal.com/consent';

export const init = (): void => {
    const iframe = document.createElement('iframe');
    iframe.src = CMP_URL;
    iframe.className = 'cmp-iframe';

    if (document.body) {
        document.body.appendChild(iframe);
    }
};
