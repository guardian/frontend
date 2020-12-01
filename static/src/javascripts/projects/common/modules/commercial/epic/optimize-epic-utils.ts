import { reportEpicError } from 'common/modules/commercial/epic/epic-utils';
import type { IframeEpicComponent } from 'common/modules/commercial/epic/iframe-epic-utils';
import { displayIframeEpic } from 'common/modules/commercial/epic/iframe-epic-utils';
import config from 'lib/config';

const displayOptimizeEpic = (): Promise<IframeEpicComponent> => {
    const url = config.get('page.optimizeEpicUrl');
    if (url) {
        // TODO: allow fallback ab test to be set via function argument?
        return displayIframeEpic(url);
    }
    const urlError = new Error('config page.optimizeEpicUrl not found');
    reportEpicError(urlError);
    return Promise.reject(urlError);
};

export { displayOptimizeEpic };
