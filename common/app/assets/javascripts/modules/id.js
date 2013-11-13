/*global escape:true */
define(['common',
        'modules/cookies',
        'modules/asyncCallMerger',
        'modules/storage',
        'ajax'
], function(
    common,
    Cookies,
    asyncCallMerger,
    Storage,
    ajax) {
    /**
     * Left this as an object as there are onlty static methods
     * We'll need to change this once there is some state change
     * TODO(jamesgorrie): Allow this to show policies too (not needed yet)
     */
    var Id = {},
        userFromCookieCache = null;

    Id.cookieName = 'GU_U';
    Id.signOutCookieName = 'GU_SO',
    Id.fbCheckKey = "gu.id.nextFbCheck";

    var idApiRoot = null,
        idUrl = null;

    Id.init = function(conf) {
        idApiRoot = conf.page.idApiUrl;
        idUrl = conf.page.idUrl;
    };


    /**
     * Clears the caches and state, primarily for testing.
     */
    Id.reset = function() {
        Id.getUserFromApi.reset();
        userFromCookieCache = null;
    };

    /**
     * The array returned from the cookie is in the format
     * [ id, email, displayname, userGroupBitmask ]
     * @return {?Object} the user information
     */
    Id.getUserFromCookie = function() {
        if(userFromCookieCache === null ) {
            var cookieData = Cookies.get(Id.cookieName),
            userData = cookieData ? JSON.parse(Id.decodeBase64(cookieData.split('.')[0])) : null;
            if (userData) {
                userFromCookieCache = {
                    id: userData[0],
                    primaryEmailAddress: userData[1],
                    displayName: userData[2],
                    rawResponse: cookieData
                };
            }
        }

        return userFromCookieCache;
    };

    /**
     * @return {string}
     */
    Id.getCookie = function() {
        return Cookies.get(Id.cookieName);
    };

    /**
     * @return {boolean}
     */
    Id.isUserLoggedIn = function() {
        return Id.getUserFromCookie() !== null;
    };

    /**
     * @return {string}
     */
    Id.getUrl = function() {
        return idUrl;
    };


    /**
     * Gets the currently logged in user data from the identity api
     * @param {function} callback
     */
    Id.getUserFromApi = asyncCallMerger.mergeCalls(
        function(mergingCallback) {
            if(Id.isUserLoggedIn()) {
                ajax({
                    url: idApiRoot + "/user/me",
                    type: 'jsonp',
                    crossOrigin: true
                }).then(
                    function(response) {
                        if(response.status === 'ok') {
                            mergingCallback(response.user);
                        } else {
                            mergingCallback(null);
                        }
                    }
                );
            } else {
                mergingCallback(null);
            }
        }
    );

    /**
     * Handles unicode chars correctly
     * @param {string} str
     * @return {string}
     */
    Id.decodeBase64 = function(str) {
        return decodeURIComponent(escape(common.atob(str.replace(/-/g, '+').replace(/_/g, '/').replace(/,/g, '='))));
    };

    Id._hasUserSignedOutInTheLast24Hours = function() {
        var cookieData = Cookies.get(Id.signOutCookieName);

        if(cookieData) {
            return((Math.round(new Date().getTime() / 1000)) < (parseInt(cookieData, 10) + 86400));
        }
        return false;
    };

    /**
     * Returns true if a there is no signed in user and the user has not signed in the last 24 hous
     */
    Id.shouldAutoSigninInUser = function() {
        var signedInUser = !!Cookies.get(Id.cookieName);
        var checkFacebook = !!Storage.local.get(Id.fbCheckKey);
        return !signedInUser && !checkFacebook && !this._hasUserSignedOutInTheLast24Hours();
    };

    return Id;
});