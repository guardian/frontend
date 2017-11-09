// @flow
import config from 'lib/config';

export const ias: ThirdPartyTag = {
    shouldRun: config.switches.abIasAdTargeting,
    url: '//cdn.adsafeprotected.com/iasPET.1.js',
};
