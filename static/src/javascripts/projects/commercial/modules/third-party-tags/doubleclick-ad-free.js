// @flow

import { commercialFeatures } from 'commercial/modules/commercial-features';
import config from 'lib/config';

const doubleClickRandom = (): string => {
    const axel = Math.random();
    const a = axel * 10000000000000;
    return a.toString();
};

export const doubleClickAdFree: ThirdPartyTag = {
    shouldRun:
        commercialFeatures.adFree && config.switches.doubleclickYoutubeAdFree,
    useImage: true,
    url: `//pubads.g.doubleclick.net/activity;dc_iu=/${config.page
        .dfpAccountId}/;ord=${doubleClickRandom()};af=T;dc_seg=482549580?`,
};
