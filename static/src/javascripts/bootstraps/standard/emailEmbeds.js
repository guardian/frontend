// @flow

import config from 'lib/config';

const initEmbedResize = () => {
    const iframes: HTMLIFrameElement[] = ([
        ...document.querySelectorAll('.element-embed > .email-sub__iframe'),
    ]: any);

    window.addEventListener('message', event => {
        const iframe: ?HTMLIFrameElement = iframes.find(i => {
            try {
                return i.src === event.source.location.href;
            } catch (e) {
                return false;
            }
        });
        if (iframe) {
            try {
                const message = JSON.parse(event.data);
                switch (message.type) {
                    case 'set-height':
                        iframe.height = message.value;
                        break;
                    default:
                }
                // eslint-disable-next-line no-empty
            } catch (e) {
            }
        }
    });
};
export { initEmbedResize };
