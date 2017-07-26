// @flow

import { commercialFeatures } from 'commercial/modules/commercial-features';
import config from 'lib/config';

export const doubleClickAdFree: ThirdPartyTag = {
    shouldRun: commercialFeatures.adFree,
    useImage: true,
    url: `//pubads.g.doubleclick.net/activity;dc_iu=/${config.page
        .dfpAccountId}/;ord=1;af=T;dc_seg=482549580?`,
};
