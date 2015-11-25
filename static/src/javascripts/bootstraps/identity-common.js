/**
 * Identity crap that has to run on every page (putting in usernames, avatars, etc.)
 *
 * Explicitly NOT stuff that only runs on the identity pages. Put that in profile.js or I will hunt you down. I WILL
 * HUNT YOU DOWN.
 */
define([
    'common/utils/robust',
    'common/modules/identity/api'
], function (
    robust,
    Id
) {
    function setCssClass(config) {
        Id.init(config);
        // Used to show elements that need signin. Use .sign-in-required
        if (Id.isUserLoggedIn()) {
            document.documentElement.className = document.documentElement.className
                .replace(/\bid--signed-out\b/, 'id--signed-in');
        }
    }

    return function () {
        robust.catchErrorsAndLog('i-css-class', setCssClass);
    };
});
