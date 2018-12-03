// @flow

import { removeCookie, addCookie } from 'lib/cookies';
import { isUserLoggedIn } from 'common/modules/identity/api';
import { readerRevenueRelevantCookies } from 'common/modules/commercial/user-features';
import { clearViewLog } from 'common/modules/commercial/acquisitions-view-log';
import { clearParticipations } from 'common/modules/experiments/utils';

const showMeTheEpic = () => {
    readerRevenueRelevantCookies.forEach(cookie => removeCookie(cookie));

    clearViewLog();
    clearParticipations();

    // Make sure this is set. Since it's set by Fastly,
    // sometimes it's not set in dev.
    addCookie('GU_mvt_id', '1');

    if (isUserLoggedIn()) {
        // TODO: vary according to environment
        window.location.assign('https://profile.theguardian.com/signout');
    } else {
        window.location.reload();
    }
};

export const init = () => {
    // Expose functions so they can be called on the console and within bookmarklets
    window.guardian.readerRevenue = {
        showMeTheEpic,
    };
};
