// @flow
// FIXME
// import config from 'lib/config';

import {
    insertAtSubmeta,
    reportEpicError,
} from 'common/modules/commercial/epic/epic-utils';

import type { EpicComponent } from 'common/modules/commercial/epic/epic-utils';

const createEpicIframe = (url: string): Promise<EpicComponent> => {
    const container = document.createElement('div');
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.frameBorder = '0';
    container.appendChild(iframe);
    // TODO: check epic has been rendered in iframe
    return Promise.resolve({
        html: container,
    });
};

const displayEpicIframe = (url: string): Promise<EpicComponent> =>
    createEpicIframe(url).then(insertAtSubmeta);

const getOptimizeEpicUrl = (): ?string =>
    // FIXME
    // const host = config.get('page.supportUrl');
    // if (!host) {
    //     return undefined;
    // }
    // return host + '/epic/v1/index.html';
    'https://support.code.dev-theguardian.com/epic/v1/index.html';

const displayOptimizeEpic = (): Promise<EpicComponent> => {
    const url = getOptimizeEpicUrl();
    if (!url) {
        return Promise.reject(
            new Error('unable to get default optimize epic url')
        );
    }
    return displayEpicIframe(url).catch(err => {
        reportEpicError(err);
        throw err;
    });
};

export { displayOptimizeEpic };
