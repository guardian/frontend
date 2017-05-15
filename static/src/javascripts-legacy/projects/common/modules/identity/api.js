/*global escape:true */
define([
    'lib/ajax',
    'lib/atob',
    'lib/config',
    'lib/cookies',
    'lib/mediator',
    'lib/storage',
    'common/modules/asyncCallMerger'
], function (
    ajax,
    utilAtob,
    config,
    cookies,
    mediator,
    storage,
    asyncCallMerger
) {

    /**
     * Left this as an object as there are only static methods
     * We'll need to change this once there is some state change
     * TODO(jamesgorrie): Allow this to show policies too (not needed yet)
     */
    var Id = {},
        userFromCookieCache = null;

    Id.cookieName = 'GU_U';
    Id.signOutCookieName = 'GU_SO';
    Id.fbCheckKey = 'gu.id.nextFbCheck';
    Id.lastRefreshKey = 'identity.lastRefresh';
    Id.idApiRoot = null;
    Id.idUrl = null;

    Id.init = function () {
        Id.idApiRoot = config.page.idApiUrl;
        Id.idUrl = config.page.idUrl;
        mediator.emit('module:identity:api:loaded');
    };

    /**
     * Clears the caches and state, primarily for testing.
     */
    Id.reset = function () {
        Id.getUserFromApi.reset();
        userFromCookieCache = null;
    };

    /**
     * The object returned from the cookie has the keys:
     *
     * {
     *    id
     *    primaryEmailAddress
     *    displayName
     *    accountCreatedDate
     *    emailVerified
     *    rawResponse
     * };
     *
     * @return {?Object} the user information
     */
    Id.getUserFromCookie = function () {
        if (userFromCookieCache === null) {
            var cookieData = cookies.getCookie(Id.cookieName),
                userData = cookieData ? JSON.parse(Id.decodeBase64(cookieData.split('.')[0])) : null;
            if (userData) {
                var displayName = decodeURIComponent(userData[2]);
                userFromCookieCache = {
                    id: userData[0],
                    primaryEmailAddress: userData[1], // not sure where this is stored now - not in the cookie any more
                    displayName: displayName,
                    accountCreatedDate: userData[6],
                    emailVerified: userData[7],
                    rawResponse: cookieData
                };
            }
        }

        return userFromCookieCache;
    };

    /**
     * @return {string}
     */
    Id.getCookie = function () {
        return cookies.getCookie(Id.cookieName);
    };

    /**
     * @return {boolean}
     */
    Id.isUserLoggedIn = function () {
        return Id.getUserFromCookie() !== null;
    };

    /**
     * @return {string}
     */
    Id.getUrl = function () {
        return Id.idUrl;
    };

    /**
     * Gets the currently logged in user data from the identity api
     * @param {function} callback
     */
    Id.getUserFromApi = asyncCallMerger.mergeCalls(
        function (mergingCallback) {
            if (Id.isUserLoggedIn()) {
                ajax.ajax({
                    url: Id.idApiRoot + '/user/me',
                    type: 'jsonp',
                    crossOrigin: true
                }).then(
                    function (response) {
                        if (response.status === 'ok') {
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
     * Gets the currently logged in user data from the identity api and
     * refreshes the users cookie at the same time.
     */
    Id.getUserFromApiWithRefreshedCookie = function () {
        var endpoint = '/user/me',
            request = ajax.ajax({
                url: Id.idApiRoot + endpoint,
                type: 'jsonp',
                data: {
                    refreshCookie: true
                }
            });

        return request;
    };

    /**
     * Returns user object when signed in, otherwise redirects to sign in with configurable absolute returnUrl
     */
    Id.getUserOrSignIn = function (returnUrl) {
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
    Id.redirectTo = function (url) {
        window.location.href = url;
    };

    /**
     * Handles unicode chars correctly
     * @param {string} str
     * @return {string}
     */
    Id.decodeBase64 = function (str) {
        return decodeURIComponent(escape(utilAtob(str.replace(/-/g, '+').replace(/_/g, '/').replace(/,/g, '='))));
    };

    /**
     * @return {Boolean}
     */
    Id.hasUserSignedOutInTheLast24Hours = function () {
        var cookieData = cookies.getCookie(Id.signOutCookieName);

        if (cookieData) {
            return ((Math.round(new Date().getTime() / 1000)) < (parseInt(cookieData, 10) + 86400));
        }
        return false;
    };

    /**
     * Returns true if a there is no signed in user and the user has not signed in the last 24 hours
     */
    Id.shouldAutoSigninInUser = function () {
        var signedInUser = !!cookies.getCookie(Id.cookieName),
            checkFacebook = !!storage.local.get(Id.fbCheckKey);
        return !signedInUser && !checkFacebook && !this.hasUserSignedOutInTheLast24Hours();
    };

    Id.setNextFbCheckTime = function (nextFbCheckDue) {
        storage.local.set(Id.fbCheckKey, {}, { expires: nextFbCheckDue });
    };

    Id.emailSignup = function (listId) {
        var endpoint = '/useremails/' + Id.getUserFromCookie().id + '/subscriptions',
            data = { 'listId': listId },
            request = ajax.ajax({
                url: Id.idApiRoot + endpoint,
                type: 'jsonp',
                crossOrigin: true,
                data: {
                    body: JSON.stringify(data),
                    method: 'post'
                }
            });

        return request;
    };

    Id.getUserEmailSignUps = function () {
        if (Id.getUserFromCookie()) {
            var endpoint = '/useremails/' + Id.getUserFromCookie().id,
                request = ajax.ajax({
                    url: Id.idApiRoot + endpoint,
                    type: 'jsonp',
                    crossOrigin: true
                });

            return request;
        }

        return Promise.resolve(null);
    };

    Id.sendValidationEmail = function () {
        var endpoint = '/user/send-validation-email',
            request = ajax.ajax({
                url: Id.idApiRoot + endpoint,
                type: 'jsonp',
                crossOrigin: true,
                data: {
                    method: 'post'
                }
            });

        return request;
    };

    Id.updateUsername = function (username) {
        var endpoint = '/user/me',
            data = {'publicFields': {'username': username, 'displayName': username}},
            request = ajax.ajax({
                url: Id.idApiRoot + endpoint,
                type: 'json',
                crossOrigin: true,
                method: 'POST',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(data),
                withCredentials: true,
                headers: {
                    'X-GU-ID-Client-Access-Token':  'Bearer ' + config.page.idApiJsClientToken
                }
            });

        return request;
    };

    return Id;
});
