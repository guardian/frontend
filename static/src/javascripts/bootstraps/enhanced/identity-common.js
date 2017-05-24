/**
 * Identity crap that has to run on every page (putting in usernames, avatars, etc.)
 *
 * Explicitly NOT stuff that only runs on the identity pages. Put that in profile.js or I will hunt you down. I WILL
 * HUNT YOU DOWN.
 */
import robust from 'lib/robust';
import Id from 'common/modules/identity/api';

function setCssClass() {
    // Used to show elements that need signin. Use .sign-in-required
    if (Id.isUserLoggedIn()) {
        document.documentElement.className = document.documentElement.className
            .replace(/\bid--signed-out\b/, 'id--signed-in');
    }
}

export default function() {
    robust.catchErrorsWithContext([
        ['i-css-class', setCssClass],
    ]);
};
