import config from 'lib/config'

import { insertAtSubmeta, reportEpicError } from 'common/modules/commercial/epic/epic-utils';

import type { EpicComponent } from 'common/modules/commercial/epic/epic-utils';

const createOptimizeIframe = (url: string): Promise<EpicComponent> => {
    const container = document.createElement('div');
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.frameBorder = 0;
    container.appendChild(iframe);
    // TODO: check epic has been rendered in iframe
    return Promise.resolve({
        html: container,
    });
};

const displayOptimizeEpic = (url: string): Promise<EpicComponent> => {
    return createOptimizeIframe(url).then(insertAtSubmeta);
};

const getDefaultOptimizeEpicUrl = (): ?string => {
    // FIXME
    // const host = config.get('page.supportUrl');
    // if (!host) {
    //     return undefined;
    // }
    // return host + '/epic/v1/index.html';
    return 'https://support.code.dev-theguardian.com/epic/v1/index.html';
};

const displayDefaultOptimizeEpic = (): Promise<EpicComponent> => {
    const url = getDefaultOptimizeEpicUrl();
    if (!url) {
        return Promise.reject(new Error('unable to get default optimize epic url'))
    }
    return displayOptimizeEpic(url).catch(err => {
        reportEpicError(err);
        throw err;
    })
};

export { displayDefaultOptimizeEpic }
