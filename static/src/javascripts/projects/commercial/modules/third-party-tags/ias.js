// @flow
import config from 'lib/config';
import { getTestVariantId } from 'common/modules/experiments/utils';

export const ias: ThirdPartyTag = {
    shouldRun:
        config.get('switches.abIasAdTargeting', false) &&
        getTestVariantId('IasAdTargetingV2') === 'variant',
    url: '//cdn.adsafeprotected.com/iasPET.1.js',
};
