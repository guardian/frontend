import fastdom from 'fastdom';
import $ from 'lib/$';
import { getCookie, addCookie } from 'lib/cookies';
import { isIOS, isAndroid, getBreakpoint, userAgent } from 'lib/detect';
import template from 'lodash/template';
import { loadCssPromise } from 'lib/load-css-promise';
import { Message, hasUserAcknowledgedBanner } from 'common/modules/ui/message';
import config from 'lib/config';

/**
 * Rules:
 *
 * 4 visits within the last month
 * Less than 4 impressions
 * Persist close state
 */
const COOKIE_IMPRESSION_KEY = 'GU_SMARTAPPBANNER';

const DATA = {
    IOS: {
        LOGO: 'https://assets.guim.co.uk/images/apps/app-logo.png',
        SCREENSHOTS:
            'https://assets.guim.co.uk/images/apps/ios-screenshots.jpg',
        LINK: 'https://itunes.apple.com/gb/app/the-guardian/id409128287?mt=8',
        STORE: 'on the App Store',
    },
    ANDROID: {
        LOGO: 'https://assets.guim.co.uk/images/apps/app-logo.png',
        SCREENSHOTS:
            'https://assets.guim.co.uk/images/apps/ios-screenshots.jpg',
        LINK: 'https://play.google.com/store/apps/details?id=com.guardian',
        STORE: 'in Google Play',
    },
};

const cookieVal = getCookie(COOKIE_IMPRESSION_KEY);

const impressions =
    cookieVal && !Number.isNaN(cookieVal) ? parseInt(cookieVal, 10) : 0;

const tmp =
    '<img src="<%=LOGO%>" class="app__logo" alt="Guardian App logo" /><div class="app__cta"><h4 class="app__heading">The Guardian app</h4>' +
    '<p class="app__copy">Instant alerts. Offline reading.<br/>Tailored to you.</p>' +
    '<p class="app__copy"><strong>FREE</strong> – <%=STORE%></p></div><a href="<%=LINK%>" class="app__link">View</a>';

const tablet =
    '<img src="<%=SCREENSHOTS%>" class="app__screenshots" alt="screenshots" />';

const isDevice = () => isIOS() || isAndroid();

const validImpressionCount = () => impressions < 4;

const messageCode = isIOS() ? 'ios' : 'android';

const canUseSmartBanner = () =>
    config.get('switches.smartAppBanner') &&
    userAgent.browser === 'Safari' &&
    isIOS();

const canShow = () =>
    new Promise(resolve => {
        const result =
            !canUseSmartBanner() &&
            isDevice() &&
            validImpressionCount() &&
            !hasUserAcknowledgedBanner(messageCode);
        resolve(result);
    });

const show = () =>
    loadCssPromise.then(() => {
        const msg = new Message(messageCode, { position: 'top' });
        const fullTemplate = tmp + (getBreakpoint() === 'mobile' ? '' : tablet);

        msg.show(template(fullTemplate)(DATA[messageCode.toUpperCase()]));

        addCookie(COOKIE_IMPRESSION_KEY, String(impressions + 1));

        fastdom.measure(() => {
            const $banner = $('.site-message--ios, .site-message--android');
            const bannerHeight = $banner.dim().height;
            if (window.scrollY !== 0) {
                window.scrollTo(window.scrollX, window.scrollY + bannerHeight);
            }
        });

        return true;
    });

const smartAppBanner = {
    id: messageCode,
    show,
    canShow,
};

export { smartAppBanner };
