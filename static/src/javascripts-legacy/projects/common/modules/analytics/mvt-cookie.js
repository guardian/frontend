define([
    'lib/cookies'
], function (
    cookies
) {
    var MULTIVARIATE_ID_COOKIE = 'GU_mvt_id',
        VISITOR_ID_COOKIE = 's_vi',
        BROWSER_ID_COOKIE = 'bwid',
        // The full mvt ID interval is [1, 1000000]
        MAX_CLIENT_MVT_ID = 1000000;

    function overwriteMvtCookie(testId) {
        // For test purposes only.
        cookies.addCookie(MULTIVARIATE_ID_COOKIE, testId, 365);
    }

    function getMvtFullId() {
        var bwidCookie = cookies.getCookie(BROWSER_ID_COOKIE),
            mvtidCookie = getMvtValue(),
            visitoridCookie = cookies.getCookie(VISITOR_ID_COOKIE);

        if (!visitoridCookie) {
            visitoridCookie = 'unknown-visitor-id';
        }

        if (!bwidCookie) {
            bwidCookie = 'unknown-browser-id';
        }

        if (!mvtidCookie) {
            mvtidCookie = 'unknown-mvt-id';
        }

        return visitoridCookie + ' ' + bwidCookie + ' ' + mvtidCookie;
    }

    function getMvtValue() {
        return cookies.getCookie(MULTIVARIATE_ID_COOKIE);
    }

    function getMvtNumValues() {
        return MAX_CLIENT_MVT_ID;
    }

    return {
        getMvtFullId: getMvtFullId,
        getMvtValue: getMvtValue,
        getMvtNumValues: getMvtNumValues,
        overwriteMvtCookie: overwriteMvtCookie,
        MAX_CLIENT_MVT_ID: MAX_CLIENT_MVT_ID
    };
});
