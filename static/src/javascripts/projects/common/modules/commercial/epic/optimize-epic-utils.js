// @flow

import { constructQuery as constructURLQuery } from 'lib/url';
import config from 'lib/config';

import { displayIframeEpic } from 'common/modules/commercial/epic/iframe-epic-utils';

import type { EpicComponent } from 'common/modules/commercial/epic/epic-utils';

const getOptimizeEpicUrl = (): string => {
    const url =
        config.get('page.optimizeEpicUrl') ||
        // FIXME
        'http://reader-revenue-components.s3-website-eu-west-1.amazonaws.com/epic/v1/index.html';
    // data passed in query string used to augment acquisition tracking link in iframe
    const params = constructURLQuery({
        pvid: config.get('ophan.pageViewId'),
        url: window.location.href.split('?')[0],
    });
    return `${url}?${params}`;
};

const displayOptimizeEpic = (): Promise<EpicComponent> => {
    const url = getOptimizeEpicUrl();
    return displayIframeEpic(url);
};

export { displayOptimizeEpic };
