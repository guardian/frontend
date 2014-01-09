define([
    'common/utils/cookies'
], function (
    cookies
) {
    var MULTIVARIATE_ID_COOKIE = "GU_mvt_id",
        VISITOR_ID_COOKIE ="s_vi",
        BROWSER_ID_COOKIE = "bwid";

    // Nice manageable range :)
    var MAX_INT = 1000000;

    function generateMvtCookie() {
        if (!getMvtValue() || getMvtValue() > MAX_INT) {
            var mvtId = generateRandomInteger(MAX_INT, 1);
            cookies.add(MULTIVARIATE_ID_COOKIE, mvtId, 365);
        }

        // Temporary cleanup call for old cookie with incorrect domain.
        cookies.cleanUp(['GU_mvtid']);
    }

    function overwriteMvtCookie(testId) {
        // For test purposes.
        cookies.add(MULTIVARIATE_ID_COOKIE, testId, 365);
    }

    function getMvtFullId() {
        var bwidCookie = cookies.get(BROWSER_ID_COOKIE),
            mvtidCookie = getMvtValue(),
            visitoridCookie = cookies.get(VISITOR_ID_COOKIE);

        if (!visitoridCookie) {
            visitoridCookie = "unknown-visitor-id";
        }

        if (!bwidCookie) {
            bwidCookie = "unknown-browser-id";
        }

        if (!mvtidCookie) {
            mvtidCookie = "unknown-mvt-id";
        }

        return visitoridCookie + " " + bwidCookie + " " + mvtidCookie;
    }

    function getMvtValue() {
        return cookies.get(MULTIVARIATE_ID_COOKIE);
    }

    function getMvtNumValues() {
        return MAX_INT;
    }

    function generateRandomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    return {
        generateMvtCookie: generateMvtCookie,
        getMvtFullId: getMvtFullId,
        getMvtValue: getMvtValue,
        getMvtNumValues: getMvtNumValues,
        overwriteMvtCookie: overwriteMvtCookie,
        MAX_INT: MAX_INT
    };
});
