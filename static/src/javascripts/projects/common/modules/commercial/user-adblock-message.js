define([
    'common/utils/ajax-promise',
    'common/utils/cookies'
], function (
    ajaxPromise,
    cookies
) {
    //right now we assume that the user who is a member (any of 3 paid tiers) and do not want to see ads, also won't see adblock messages
    function isUserMember() {
        var isMemberCookie = cookies.get('gu_adfree_user'),
            promise;

        if (!isMemberCookie) {
            ajaxPromise({
                url: 'https://members-data-api.theguardian.com/user-attributes/me/adfree',
                type: 'json',
                method: 'get',
                crossOrigin: true/*,
                data: queryParams */
            }).then(function (resp) {
                console.log(resp);
                isMemberCookie = cookies.add('gu_adfree_user', resp.adfree);
            });
        }

        return isMemberCookie ? true : false;
    }

    return {
        isUserMember : isUserMember()
    };
});
