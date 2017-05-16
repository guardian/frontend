// @flow
import { addCookie, getCookie } from 'lib/cookies';

const MULTIVARIATE_ID_COOKIE = 'GU_mvt_id';
const VISITOR_ID_COOKIE = 's_vi';
const BROWSER_ID_COOKIE = 'bwid';
// The full mvt ID interval is [1, 1000000]
const MAX_CLIENT_MVT_ID = 1000000;

// For test purposes only.
export const overwriteMvtCookie = (testId: string) =>
    addCookie(MULTIVARIATE_ID_COOKIE, testId, 365);

export const getMvtValue = (): number =>
    Number(getCookie(MULTIVARIATE_ID_COOKIE));

export const getMvtNumValues = (): number => Number(MAX_CLIENT_MVT_ID);

export const getMvtFullId = (): string => {
    const bwidCookie = getCookie(BROWSER_ID_COOKIE) || 'unknown-browser-id';
    const mvtidCookie = getMvtValue() || 'unknown-mvt-id';
    const visitoridCookie =
        getCookie(VISITOR_ID_COOKIE) || 'unknown-visitor-id';

    return `${visitoridCookie} ${bwidCookie} ${mvtidCookie}`;
};
