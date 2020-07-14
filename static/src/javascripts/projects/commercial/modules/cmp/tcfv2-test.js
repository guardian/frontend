// @flow

import { isInUsa } from 'common/modules/commercial/geo-utils';
import config from 'lib/config';

let isInTest;

const isInServerSideTest = (): boolean =>
    config.get('tests.useTcfv2Variant') === 'variant';

export const isInTcfv2Test = (): boolean => {
    return true; // TODO: Remove!

    if (typeof isInTest === 'undefined') {
        console.log(
            '[CMP—TCFv2]',
            'isInUsa',
            isInUsa(),
            '—',
            'isInServerSideTest',
            isInServerSideTest()
        );
        isInTest = !isInUsa() && isInServerSideTest();
    }

    return isInTest;
};
