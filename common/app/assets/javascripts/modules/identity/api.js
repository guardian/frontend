/*global escape:true */
define(['common', 'utils/cookies', 'modules/asyncCallMerger', 'utils/ajax'], function(common, Cookies, asyncCallMerger, ajax) {
    /**
     * Left this as an object as there are onlty static methods
     * We'll need to change this once there is some state change
     * TODO(jamesgorrie): Allow this to show policies too (not needed yet)
     */
    var Id = {},
        userFromCookieCache = "empty";

    Id.cookieName = 'GU_U';

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
        userFromCookieCache = "empty";
    };

    /**
     * The array returned from the cookie is in the format
     * [ id, email, displayname, userGroupBitmask ]
     * @return {?Object} the user information
     */
    Id.getUserFromCookie = function() {
        if(userFromCookieCache === "empty") {
            var cookieData = Cookies.get(Id.cookieName),
            userData = cookieData ? JSON.parse(Id.decodeBase64(cookieData.split('.')[0])) : null;
            if (userData) {
                userFromCookieCache = {
                    id: userData[0],
                    primaryEmailAddress: userData[1],
                    displayName: userData[2],
                    rawResponse: cookieData
                };
            } else {
                userFromCookieCache = null;
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

    return Id;
});
