define([
    'utils/cookies'
], function (
    cookies
) {
    var MULTIVARIATE_ID_COOKIE = "GU_mvtid",
        BROWSER_ID_COOKIE = "bwid",
        bwidCookie, mvtidCookie;

    // Max integer is 2^53 (52-bit mantissa plus implicit integer bit 1).
    var MAX_INT = 9007199254740992;

    function init() {
        bwidCookie = cookies.get(BROWSER_ID_COOKIE);
        mvtidCookie = cookies.get(MULTIVARIATE_ID_COOKIE);

        // Add an mvt cookie if there isn't one to complement the Ophan browser id.
        if (bwidCookie && !mvtidCookie) {
            var mvtId = generateRandomInteger(MAX_INT, 1);
            cookies.add(MULTIVARIATE_ID_COOKIE, mvtId, 365);
        }
    }

    function getMvtFullId() {
        if (bwidCookie && mvtidCookie) {
            return bwidCookie + " " + mvtidCookie;
        } else {
            return "";
        }
    }

    function getMvtValue() {
        return mvtidCookie;
    }

    function generateRandomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    return {
        init: init,
        getMvtFullId: getMvtFullId,
        getMvtValue: getMvtValue
    };
});
