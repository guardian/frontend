// @flow

import { isInUsa } from 'common/modules/commercial/geo-utils';
import config from 'lib/config';

let isInTest;

const isInServerSideTest = (): boolean =>
    config.get('tests.useTcfv2Variant') === 'variant';

export const isInTcfv2Test = (): boolean => {
    if (typeof isInTest === 'undefined') {
        console.log(
            '[CMP—TCFv2]',
            'isInUsa',
            isInUsa(),
            '—',
            'isInServerSideTest',
            isInServerSideTest()
        );
        // TODO REMOVE true which is used for testing
        isInTest = true || (!isInUsa() && isInServerSideTest());
    }

    return isInTest;
};
