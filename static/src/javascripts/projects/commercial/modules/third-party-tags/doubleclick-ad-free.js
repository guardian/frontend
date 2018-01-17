// @flow

import { commercialFeatures } from 'common/modules/commercial/commercial-features';
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
    url: `//pubads.g.doubleclick.net/activity;dc_iu=/${
        config.page.dfpAccountId
    }/DFPAudiencePixel;ord=${doubleClickRandom()};dc_seg=482549580;af=T?`,
};
