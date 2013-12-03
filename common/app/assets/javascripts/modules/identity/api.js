/*global escape:true */
define([
    '$',
    'utils/atob',
    'utils/cookies',
    'utils/storage',
    'utils/ajax',
    'modules/asyncCallMerger',
], function(
    $,
    utilAtob,
    cookies,
    storage,
    ajax,
    asyncCallMerger
) {

    /**
     * Left this as an object as there are onlty static methods
     * We'll need to change this once there is some state change
     * TODO(jamesgorrie): Allow this to show policies too (not needed yet)
     */
    var Id = {},
        userFromCookieCache = null;

    Id.cookieName = 'GU_U';
    Id.signOutCookieName = 'GU_SO';
    Id.fbCheckKey = "gu.id.nextFbCheck";
    Id.idApiRoot = null;
    Id.idUrl = null;

    Id.init = function(conf) {
        Id.idApiRoot = conf.page.idApiUrl;
        Id.idUrl = conf.page.idUrl;
        // Small DOM init for elements that need to be signed in
        if (Id.isUserLoggedIn()) {
            $('html').addClass('id--signed-in');
        } else {
            $('html').addClass('id--signed-out');
        }
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
        if (userFromCookieCache === null) {
            var cookieData = cookies.get(Id.cookieName),
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
        return cookies.get(Id.cookieName);
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
        return Id.idUrl;
    };


    /**
     * Gets the currently logged in user data from the identity api
     * @param {function} callback
     */
    Id.getUserFromApi = asyncCallMerger.mergeCalls(
        function(mergingCallback) {
            if(Id.isUserLoggedIn()) {
                ajax({
                    url: Id.idApiRoot + "/user/me",
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
     * Returns user object when signed in, otherwise redirects to sign in with configurable absolute returnUrl
     */
    Id.getUserOrSignIn = function(returnUrl) {
        if (Id.isUserLoggedIn()) {
            return Id.getUserFromCookie();
        } else {
            returnUrl = encodeURIComponent(returnUrl || document.location.href);
            var url = Id.getUrl() + '/signin?returnUrl=' + returnUrl;
            Id.redirectTo(url);
        }
    };

    /**
     * Wrap window.location.href so it can be spied in unit tests
     */
    Id.redirectTo = function(url) {
        window.location.href = url;
    };

    window.getUserOrSignIn = Id.getUserOrSignIn;

    /**
     * Handles unicode chars correctly
     * @param {string} str
     * @return {string}
     */
    Id.decodeBase64 = function(str) {
        return decodeURIComponent(escape(utilAtob(str.replace(/-/g, '+').replace(/_/g, '/').replace(/,/g, '='))));
    };

    /**
     * @return {Boolean}
     */
    Id.hasUserSignedOutInTheLast24Hours = function() {
        var cookieData = cookies.get(Id.signOutCookieName);

        if(cookieData) {
            return((Math.round(new Date().getTime() / 1000)) < (parseInt(cookieData, 10) + 86400));
        }
        return false;
    };

    /**
     * Returns true if a there is no signed in user and the user has not signed in the last 24 hous
     */
    Id.shouldAutoSigninInUser = function() {
        var signedInUser = !!cookies.get(Id.cookieName);
        var checkFacebook = !!storage.local.get(Id.fbCheckKey);
        return !signedInUser && !checkFacebook && !this.hasUserSignedOutInTheLast24Hours();
    };

    Id.setNextFbCheckTime = function(nextFbCheckDue) {
        storage.local.set(Id.fbCheckKey, {}, {expires: nextFbCheckDue});
    };

    return Id;
});
