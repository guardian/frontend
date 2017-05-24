// @flow
import fastdom from 'fastdom';
import $ from 'lib/$';
import { getCookie, addCookie } from 'lib/cookies';
import detect from 'lib/detect';
import template from 'lodash/utilities/template';
import { loadCssPromise } from 'lib/load-css-promise';
import Message from 'common/modules/ui/message';
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
        LOGO: 'https://assets.guim.co.uk/images/apps/ios-logo.png',
        SCREENSHOTS: 'https://assets.guim.co.uk/images/apps/ios-screenshots.jpg',
        LINK: 'https://app.adjust.com/w97upi?deep_link=gnmguardian://root?contenttype=front&source=adjust',
        STORE: 'on the App Store',
    },
    ANDROID: {
        LOGO: 'https://assets.guim.co.uk/images/apps/android-logo-2x.png',
        SCREENSHOTS: 'https://assets.guim.co.uk/images/apps/ios-screenshots.jpg',
        LINK: 'https://app.adjust.com/642i3r?deep_link=x-gu://www.theguardian.com/?source=adjust',
        STORE: 'in Google Play',
    },
};
const cookieVal = getCookie(COOKIE_IMPRESSION_KEY);
const impressions = cookieVal && !isNaN(cookieVal)
    ? parseInt(cookieVal, 10)
    : 0;
const tmp =
    '<img src="<%=LOGO%>" class="app__logo" alt="Guardian App logo" /><div class="app__cta"><h4 class="app__heading">The Guardian app</h4>' +
    '<p class="app__copy">Instant alerts. Offline reading.<br/>Tailored to you.</p>' +
    '<p class="app__copy"><strong>FREE</strong> – <%=STORE%></p></div><a href="<%=LINK%>" class="app__link">View</a>';
const tablet =
    '<img src="<%=SCREENSHOTS%>" class="app__screenshots" alt="screenshots" />';

const isDevice = (): boolean =>
    (detect.isIOS() || detect.isAndroid()) && !detect.isFireFoxOSApp();

const canShow = (): boolean => impressions < 4;

const canUseSmartBanner = (): boolean =>
    config.switches.smartAppBanner &&
    detect.getUserAgent.browser === 'Safari' &&
    detect.isIOS();

const showMessage = (): void => {
    loadCssPromise.then(() => {
        const platform = detect.isIOS() ? 'ios' : 'android';
        const msg = new Message(platform);
        const fullTemplate =
            tmp + (detect.getBreakpoint() === 'mobile' ? '' : tablet);

        msg.show(template(fullTemplate, DATA[platform.toUpperCase()]));

        addCookie(COOKIE_IMPRESSION_KEY, String(impressions + 1));

        fastdom.read(() => {
            const $banner = $('.site-message--ios, .site-message--android');
            const bannerHeight = $banner.dim().height;
            if (window.scrollY !== 0) {
                window.scrollTo(window.scrollX, window.scrollY + bannerHeight);
            }
        });
    });
};

const init = (): void => {
    if (!canUseSmartBanner() && isDevice() && canShow()) {
        showMessage();
    }
};

const isMessageShown = (): boolean =>
    $('.site-message--android').css('display') === 'block' ||
    $('.site-message--ios').css('display') === 'block';

const getMessageHeight = (): number =>
    $('.site-message--android').dim().height ||
    $('.site-message--ios').dim().height;

export { init, isMessageShown, getMessageHeight };
