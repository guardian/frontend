// @flow

import config from 'lib/config';
import { isInUsa } from 'common/modules/commercial/geo-utils';
import { isInTcfv2Test } from './tcfv2-test';

let useSourcepointCmp;

export const shouldUseSourcepointCmp = (): boolean => {
    useSourcepointCmp = isInUsa()
        ? config.get('switches.ccpaCmpUi', false)
        : isInTcfv2Test() || config.get('switches.tcfv2Frontend', false);

    return useSourcepointCmp;
};
