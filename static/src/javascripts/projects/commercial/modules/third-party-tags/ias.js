// @flow
import config from 'lib/config';

export const ias: ThirdPartyTag = {
    shouldRun: config.get('switches.abIasAdTargeting', false),
    url: '//cdn.adsafeprotected.com/iasPET.1.js',
};
