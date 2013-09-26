/*global escape:true */
define(['common', 'modules/cookies'], function(common, Cookies) {
    /**
     * Left this as an object as there are onlty static methods
     * We'll need to change this once there is some state change
     * TODO(jamesgorrie): Allow this to show policies too (not needed yet)
     */
    var Id = {};

    /**
     * The array returned from the cookie is in the format
     * [ id, email, displayname, userGroupBitmask ]
     * @return {?Object} the user information
     */
    Id.getUserFromCookie = function() {
        var cookieData = Cookies.get('GU_U'),
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
    };

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