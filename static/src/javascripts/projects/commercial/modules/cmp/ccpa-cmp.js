// @flow
import { isInUsa } from 'common/modules/commercial/geo-utils';
import config from 'lib/config';

let ccpaApplicable;

export const isCcpaApplicable = (): boolean => {
    if (typeof ccpaApplicable === 'undefined') {
        ccpaApplicable = isInUsa() && config.get('switches.ccpaCmpUi', false);
    }
    return ccpaApplicable;
};
