// @flow
import { getCookie, addCookie } from 'lib/cookies';
import { Message } from 'common/modules/ui/message';
import type { Banner } from 'common/modules/ui/bannerPicker';

/**
 * Rules:
 *
 * UK / INT edition readers only
 * Never seen the cookie message before
 * Show once only
 * Show only on FIRST page view
 * Persist close state
 */

const EU_COOKIE_MSG = 'GU_EU_MSG';

const canShow = (): Promise<boolean> => {
    const geoContinentCookie = getCookie('GU_geo_continent');

    if (!geoContinentCookie || geoContinentCookie.toUpperCase() !== 'EU') {
        return Promise.resolve(false);
    }

    const euMessageCookie = getCookie(EU_COOKIE_MSG);

    if (euMessageCookie && euMessageCookie === 'seen') {
        return Promise.resolve(false);
    }

    return Promise.resolve(true);
};

const show = (): void => {
    const link = 'https://www.theguardian.com/info/cookies';
    const txt = `Welcome to the Guardian. This site uses cookies. Read <a href="${
        link
    }" class="cookie-message__link">our policy</a>.`;
    const opts = {
        important: true,
    };
    const cookieLifeDays = 365;
    const msg = new Message('cookies', opts);
    msg.show(txt);
    addCookie(EU_COOKIE_MSG, 'seen', cookieLifeDays);
};

const cookiesBanner: Banner = {
    id: 'cookiesBanner',
    show,
    canShow,
};

export { cookiesBanner };
