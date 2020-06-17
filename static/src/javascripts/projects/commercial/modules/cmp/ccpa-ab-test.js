// @flow
import { isInUsa } from 'common/modules/commercial/geo-utils';
import config from 'lib/config';

let isInTest;

const isInServerSideTest = (): boolean =>
    config.get('tests.ccpaCmpVariant') === 'variant';

export const isInCcpaTest = (): boolean => {
    if (typeof isInTest === 'undefined') {
        isInTest = isInUsa() && isInServerSideTest();
    }
    return isInTest;
};
