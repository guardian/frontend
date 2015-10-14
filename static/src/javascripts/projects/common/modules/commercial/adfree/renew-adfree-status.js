define([
    'common/utils/ajax-promise',
    'common/utils/config',
    'common/utils/storage'
], function (
    ajaxPromise,
    config,
    storage
) {
    return {
        /* jscs:disable disallowDanglingUnderscores */
        renew : renew,
        _handleResponse : handleResponse // expose for testing
        /* jscs:enable */
    };

    function renew() {
        var endpoint = config.page.userAttributesApiUrl + '/me/adfree';
        ajaxPromise({
            url : endpoint, // returns cookie 'gu_adfree_user'
            crossOrigin : true,
            success : handleResponse,
            error : function () {}
        });
    }

    function handleResponse(response) {
        var responseData = JSON.parse(response),
            nextCookieExpiry = getNextCookieExpiry(responseData.issuedAt);
        storage.local.set('gu.adfree.user.expiry', nextCookieExpiry);
    }

    function getNextCookieExpiry(cookieIssueTime) {
        var issueDate = new Date(cookieIssueTime || new Date()),
            issueDay = issueDate.getDate(),
            expiryDate = new Date(cookieIssueTime);

        expiryDate.setDate(issueDay + 1);
        return expiryDate.getTime();
    }

});
