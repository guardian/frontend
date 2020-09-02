// @flow

import config from 'lib/config';
import { isInUsa } from 'common/modules/commercial/geo-utils';

let useSourcepointCmp;

export const shouldUseSourcepointCmp = (): boolean => {
    useSourcepointCmp = isInUsa()
        ? config.get('switches.ccpaCmpUi', false)
        : config.get('switches.tcfv2Frontend', false);

    return useSourcepointCmp;
};
