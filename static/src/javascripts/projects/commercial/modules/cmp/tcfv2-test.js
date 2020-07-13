// @flow

import { isInUsa } from 'common/modules/commercial/geo-utils';
import config from 'lib/config';

let isInTest;

const isInServerSideTest = (): boolean => 
    config.get('tests.useTcfv2Variant') === 'variant';

export const isInTcfv2Test = (): boolean => {
    if (typeof isInTest === 'undefined') {
        isInTest = !isInUsa() && isInServerSideTest();
    }
    
    return isInTest;
};
