// @flow
// import { isInUsa } from 'common/modules/commercial/geo-utils';
import config from 'lib/config';

// let isInTest;

const isInServerSideTest = (): boolean => config.get('tests.ccpaCmp', false);

// export const isInCcpaTest = (): boolean => {
//     isInTest = isInTest || (isInUsa() && isInServerSideTest());
//     return isInTest;
// };

export const isInCcpaTest = (): boolean => isInServerSideTest();
