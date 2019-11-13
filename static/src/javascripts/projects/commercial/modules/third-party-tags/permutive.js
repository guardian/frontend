// @flow
import { permutiveTest } from 'common/modules/experiments/tests/commercial-permutive';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';

export const permutive: ThirdPartyTag = {
    shouldRun: isInVariantSynchronous(permutiveTest, 'variant'),
    url: '//cdn.permutive.com/d6691a17-6fdb-4d26-85d6-b3dd27f55f08-web.js',
};
