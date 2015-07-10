/* global isModern:false, membershipUrl:false, membershipAccess:false */

/**
 * Membership access
 * Items with either of the following fields require Membership access
 * - membershipAccess=members-only
 * - membershipAccess=paid-members-only
 */

(function(isModern, membershipUrl, membershipAccess, window) {
    // Authenticating requires CORS and withCredentials. If we don't cut the mustard then pass through.
    if(!isModern) { return; }

    require([
        'common/utils/$',
        'common/utils/ajax'
    ], function($, ajax) {

        var membershipUrl = membershipUrl,
            membershipAccess = membershipAccess,
            requiresPaidTier = (membershipAccess.indexOf('paid-members-only') !== -1),
            membershipAuthUrl = membershipUrl + '/choose-tier?membershipAccess=' + membershipAccess;

        function redirect() {
            window.location.href = membershipAuthUrl;
        }

        ajax({
            url: membershipUrl + '/user/me',
            type: 'json',
            crossOrigin: true,
            withCredentials: true
        }).then(function (resp) {
            // Check the users access matches the content
            var canViewContent = (requiresPaidTier) ? !!resp.tier && resp.isPaidTier : !!resp.tier;
            if (canViewContent) {
                $('body').removeClass('has-membership-access-requirement');
            } else {
                redirect();
            }
        }).fail(function() {
            // If the request fails assume non-member
            redirect();
        });
    });
}(isModern, membershipUrl, membershipAccess, window));
