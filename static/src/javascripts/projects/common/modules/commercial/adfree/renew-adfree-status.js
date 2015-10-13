define([
    'common/utils/ajax-promise',
    'common/utils/storage'
], function (
    ajaxPromise,
    storage
) {
    return {
        /* jscs:disable disallowDanglingUnderscores */
        renew : renew,
        _handleResponse : handleResponse // expose for testing
        /* jscs:enable */
    };

    function renew() {
        ajaxPromise({
            // Endpoint returns cookie, 'gu_adfree_user'
            url : 'https://members-data-api.theguardian.com/user-attributes/me/adfree',
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
