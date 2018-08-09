// @flow

import config from 'lib/config';

import { reportEpicError } from 'common/modules/commercial/epic/epic-utils';
import {
    addEpicDataToUrl,
    displayIframeEpic,
} from 'common/modules/commercial/epic/iframe-epic-utils';

import type { IframeEpicComponent } from 'common/modules/commercial/epic/iframe-epic-utils';

const getOptimizeEpicUrl = (): ?string => {
    const url = config.get('page.optimizeEpicUrl');
    if (url) {
        return addEpicDataToUrl(url);
    }
};

const displayOptimizeEpic = (): Promise<IframeEpicComponent> => {
    const url = getOptimizeEpicUrl();
    if (url) {
        // TODO: allow fallback ab test to be set via function argument?
        return displayIframeEpic({
            url,
            sendFonts: true,
        });
    }
    const urlError = new Error('config page.optimizeEpicUrl not found');
    reportEpicError(urlError);
    return Promise.reject(urlError);
};

export { displayOptimizeEpic };
