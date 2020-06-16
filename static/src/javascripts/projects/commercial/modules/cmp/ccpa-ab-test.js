// @flow
import { isInUsa } from 'common/modules/commercial/geo-utils';

let isInTest;

const isInServerSideTest = (): boolean => true;

export const isInCcpaTest = (): boolean => {
    isInTest = isInTest || (isInUsa() && isInServerSideTest());
    return isInTest;
};
