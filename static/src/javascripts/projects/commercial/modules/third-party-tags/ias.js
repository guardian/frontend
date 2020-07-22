// @flow
import config from 'lib/config';

export const ias: ThirdPartyTag = {
    shouldRun: config.get('switches.iasAdTargeting', false),
    url: '//cdn.adsafeprotected.com/iasPET.1.js',
    sourcepointId: '5e7ced57b8e05c485246ccf3',
};
