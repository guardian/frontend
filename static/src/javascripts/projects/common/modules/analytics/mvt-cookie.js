// @flow
import { addCookie, getCookie } from 'lib/cookies';

const MULTIVARIATE_ID_COOKIE = 'GU_mvt_id';
// The full mvt ID interval is [1, 1000000]
const MAX_CLIENT_MVT_ID = 1000000;

// For test purposes only.
export const overwriteMvtCookie = (testId: number): void =>
    addCookie(MULTIVARIATE_ID_COOKIE, String(testId), 365);

export const getMvtValue = (): number =>
    Number(getCookie(MULTIVARIATE_ID_COOKIE));

// For test purposes only.
// Since it's set by Fastly, sometimes it's not set in dev,
// but it's needed for certain A/B tests to work properly.
export const initMvtCookie = (): void => {
    if (!getCookie(MULTIVARIATE_ID_COOKIE)) {
        addCookie(MULTIVARIATE_ID_COOKIE, '1');
    }
};

export const incrementMvtCookie = (): void => {
    const mvtId = parseInt(getCookie('GU_mvt_id'), 10);
    if (mvtId) {
        if (mvtId === MAX_CLIENT_MVT_ID) {
            // Wrap back to 1 if it would exceed the max
            overwriteMvtCookie(1);
        } else {
            overwriteMvtCookie(mvtId + 1);
        }
    }
};

export const decrementMvtCookie = (): void => {
    const mvtId = parseInt(getCookie('GU_mvt_id'), 10);
    if (mvtId) {
        if (mvtId === 0) {
            // Wrap back to max if it would be less than 0
            overwriteMvtCookie(MAX_CLIENT_MVT_ID);
        } else {
            overwriteMvtCookie(mvtId - 1);
        }
    }
};

export const getMvtNumValues = (): number => Number(MAX_CLIENT_MVT_ID);
