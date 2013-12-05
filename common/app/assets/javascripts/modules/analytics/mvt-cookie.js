define([
    'utils/cookies'
], function (
    cookies
) {
    var MULTIVARIATE_ID_COOKIE = "GU_mvtid",
        BROWSER_ID_COOKIE = "bwid";

    // Max integer in IEEE-754 is 2^53 (52-bit mantissa plus implicit integer bit 1).
    var MAX_INT = 9007199254740992;

    function generateMvtCookie() {
        // Add an mvt cookie if there isn't one to complement the Ophan browser id.
        // It is unecssary to halt if Ophan failed to make a browser id cookie.
        if (!getMvtValue()) {
            var mvtId = generateRandomInteger(MAX_INT, 1);
            cookies.add(MULTIVARIATE_ID_COOKIE, mvtId, 365);
        }
    }

    function overwriteMvtCookie(testId) {
        // For test purposes.
        cookies.add(MULTIVARIATE_ID_COOKIE, testId, 365);
    }

    function getMvtFullId() {
        var fullId = "",
            bwidCookie = cookies.get(BROWSER_ID_COOKIE),
            mvtidCookie = getMvtValue();

        if (bwidCookie && mvtidCookie) {
            fullId = bwidCookie + " " + mvtidCookie;
        } else if (mvtidCookie) {
            fullId = "unknown-browser-id " + mvtidCookie;
        }
        return fullId;
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
        overwriteMvtCookie: overwriteMvtCookie
    };
});
