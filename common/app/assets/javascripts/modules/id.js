/*global escape:true */
define(['common', 'modules/cookies'], function(common, Cookies) {
    /**
     * Left this as an object as there are onlty static methods
     * We'll need to change this once there is some state change
     * TODO(jamesgorrie): Allow this to show policies too (not needed yet)
     */
    var Id = {};

    Id.cookieName = 'GU_U';

    Id.signOutCookieName = 'GU_SO';

    /**
     * The array returned from the cookie is in the format
     * [ id, email, displayname, userGroupBitmask ]
     * @return {?Object} the user information
     */
    Id.getUserFromCookie = function() {
        var cookieData = Cookies.get(Id.cookieName),
            userData = cookieData ? JSON.parse(Id.decodeBase64(cookieData.split('.')[0])) : null,
            user;

        if (userData) {
            return {
                id: userData[0],
                primaryEmailAddress: userData[1],
                displayName: userData[2],
                rawResponse: cookieData
            };
        }

        return null;
    },

    /**
     * @return {string}
     */
    Id.getCookie = function() {
        return Cookies.get(Id.cookieName);
    },

    /**
     * Handles unicode chars correctly
     * @param {string} str
     * @return {string}
     */
    Id.decodeBase64 = function(str) {
        return decodeURIComponent(escape(common.atob(str.replace(/-/g, '+').replace(/_/g, '/').replace(/,/g, '='))));
    },

    Id._hasUserSignedOutInTheLast24Hours = function() {
        var cookieData = Cookies.get(Id.signOutCookieName);

        if(cookieData) {
          return((Math.round(new Date().getTime() / 1000)) < (parseInt(cookieData, 10) + 86400));
        }
        return false;
    },

    /**
     * Returns true if a there is no signed in user and the user has not signed in the last 24 hous
     */
    Id.shouldAutoSigninInUser = function() {
      var signedInUser = Cookies.get(Id.cookieName) ? true : false;
      return !signedInUser && !this._hasUserSignedOutInTheLast24Hours();
    };

    return Id;
});