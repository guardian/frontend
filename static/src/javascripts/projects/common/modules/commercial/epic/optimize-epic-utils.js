// @flow
// FIXME
// import config from 'lib/config';

import {
    insertAtSubmeta,
    reportEpicError,
} from 'common/modules/commercial/epic/epic-utils';

import { init as initMessenger } from 'commercial/modules/messenger';
// import { init as resize } from 'commercial/modules/messenger/resize';
import {addResizeListener, lastViewportRead} from 'commercial/modules/messenger/viewport';

import type { EpicComponent } from 'common/modules/commercial/epic/epic-utils';

// TODO: fix hack
let iframe: HTMLIFrameElement;

const createEpicIframe = (id: string, url: string): Promise<EpicComponent> => new Promise((resolve, reject) => {
    const container = document.createElement('div');
    iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.id = id;
    iframe.frameBorder = '0';
    container.appendChild(iframe);
    // initMessenger(viewport);
    window.addEventListener('message', (event: MessageEvent) => {
        if (event.data === 'EPIC_READY') {
            resolve({html: container});
            return;
        }

        let data = null;
        try {
            if (typeof event.data === 'string') {
                data = JSON.parse(event.data);
            }
        } catch (err) {
            console.log('bad message', event.data);
        }

        if (data && data.type === 'viewport') {
            const msgId = data.id;

            // Send current width
            lastViewportRead().then(({width}) => {
                iframe.contentWindow.postMessage(JSON.stringify({
                    id: msgId,
                    result: {width},
                }), '*');
            });

            // Send all future widths
            addResizeListener(iframe, (alwaysNull, {width}) => {
                console.log('respond');
                // Send the viewport info to the iframe
                iframe.contentWindow.postMessage(JSON.stringify({
                    id: msgId,
                    result: {width},
                }), '*');
            });
        }

        if (data && data.type === 'resize') {
            console.log('Got resize event', data);
            iframe.style.height = `${data.value.height}px`;
            // container.style.height = `${data.value.height}px`;
        }
    });
    insertAtSubmeta({html: container}).catch(reject);
});

const displayEpicIframe = (id: string, url: string): Promise<EpicComponent> =>
    createEpicIframe(id, url)
        .then(epic => {
            const host = `${window.location.protocol}//${window.location.host}`;
            console.log('posting id to iframe');
            iframe.contentWindow.postMessage(JSON.stringify({
                id,
                host,
            }), '*');
            return epic;
        });

const optimizeEpicId = 'optimize-epic';

const getOptimizeEpicUrl = (): ?string =>
    // FIXME
    // const host = config.get('page.supportUrl');
    // if (!host) {
    //     return undefined;
    // }
    // return host + '/epic/v1/index.html';
    // 'https://support.code.dev-theguardian.com/epic/v1/index.html';
    'http://reader-revenue-components.s3-website-eu-west-1.amazonaws.com/epic/v1/index.html';

const displayOptimizeEpic = (): Promise<EpicComponent> => {
    const url = getOptimizeEpicUrl();
    if (!url) {
        return Promise.reject(
            new Error('unable to get default optimize epic url')
        );
    }
    return displayEpicIframe(optimizeEpicId, url).catch(err => {
        reportEpicError(err);
        throw err;
    });
};

export { displayOptimizeEpic };
