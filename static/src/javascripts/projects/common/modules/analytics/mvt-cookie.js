// @flow
import { addCookie, getCookie } from 'lib/cookies';

const MULTIVARIATE_ID_COOKIE = 'GU_mvt_id';
// The full mvt ID interval is [1, 1000000]
const MAX_CLIENT_MVT_ID = 1000000;

// For test purposes only.
export const overwriteMvtCookie = (testId: number): void =>
    addCookie(MULTIVARIATE_ID_COOKIE, testId, 365);

export const getMvtValue = (): number =>
    Number(getCookie(MULTIVARIATE_ID_COOKIE));

export const getMvtNumValues = (): number => Number(MAX_CLIENT_MVT_ID);
