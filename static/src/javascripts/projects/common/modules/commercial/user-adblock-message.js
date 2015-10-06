define([
    'common/utils/cookies'
], function (
    cookies
) {
    //right now we assume that the user who is a member (any of 3 paid tiers) and do not want to see ads, also won't see adblock messages
    function isUserMember() {
        return cookies.get('gu_adfree_user') ? true : false;
    }

    return {
        isUserMember : isUserMember()
    };
});
