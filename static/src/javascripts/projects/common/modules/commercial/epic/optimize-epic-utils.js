// @flow
// FIXME
// import config from 'lib/config';

import {
    insertAtSubmeta,
    reportEpicError,
} from 'common/modules/commercial/epic/epic-utils';

import type { EpicComponent } from 'common/modules/commercial/epic/epic-utils';

// TODO: fix hack
let iframe: HTMLIFrameElement;

const createEpicIframe = (id: string, url: string): Promise<EpicComponent> => {
    const container = document.createElement('div');
    iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.id = id;
    iframe.frameBorder = '0';
    container.appendChild(iframe);
    // TODO: check epic has been rendered in iframe
    return Promise.resolve({
        html: container,
    });
};

const displayEpicIframe = (id: string, url: string): Promise<EpicComponent> =>
    createEpicIframe(id, url)
        .then(insertAtSubmeta)
        .then(epic => {
            const host = `${window.location.protocol}//${window.location.host}`;
            iframe.contentWindow.postMessage({
                id,
                host,
            });
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
