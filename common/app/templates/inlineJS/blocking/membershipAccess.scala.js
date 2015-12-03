@(item: model.MetaData)(implicit request: RequestHeader)
@import conf.Configuration

/**
 * Membership access
 * Items with either of the following fields require Membership access
 * - membershipAccess=members-only
 * - membershipAccess=paid-members-only
 */
@for(membershipAccess <- item.membershipAccess if item.requiresMembershipAccess) {
    (function (window) {
        // Authenticating requires CORS and withCredentials. If we don't cut the mustard then pass through.
        if(!window.guardian.isModernBrowser) { return; }

        require([
            'common/utils/$',
            'common/utils/ajax',
            'common/modules/identity/api'
        ], function($, ajax, identity) {

            var membershipUrl = "@Configuration.id.membershipUrl",
                membersDataApiUrl = "@Configuration.id.membersDataApiUrl",
                membershipAccess = "@membershipAccess",
                requiresPaidTier = (membershipAccess.indexOf('paid-members-only') !== -1),
                membershipAuthUrl = membershipUrl + '/choose-tier?membershipAccess=' + membershipAccess;

            function redirect() {
                window.location.href = membershipAuthUrl;
            }

            if (identity.isUserLoggedIn()) {
                ajax({
                    url: membersDataApiUrl + '/user-attributes/me/membership',
                    type: 'json',
                    crossOrigin: true,
                    withCredentials: true
                }).then(function (resp) {
                    var access = resp.contentAccess
                    // Check the users access matches the content
                    var canViewContent = access && (requiresPaidTier) ? !!access.paidMember : !!access.member;
                    if (canViewContent) {
                        $('body').removeClass('has-membership-access-requirement');
                    } else {
                        redirect();
                    }
                }).fail(function() {
                    // If the request fails assume non-member
                    redirect();
                });
            } else {
                redirect();
            }

        });
    }(window));
}
