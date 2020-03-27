// @flow

import config from 'lib/config';
import { local } from 'lib/storage';
import userPrefs from 'common/modules/user-prefs';

import { shouldHideSupportMessaging } from 'common/modules/commercial/user-features';
import {
    pageShouldHideReaderRevenue,
    getReaderRevenueRegion,
} from 'common/modules/commercial/contributions-utilities';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { isUserLoggedIn } from 'common/modules/identity/api';
import fetchJson from 'lib/fetch-json';
import reportError from 'lib/report-error';

// types
import type { ReaderRevenueRegion } from 'common/modules/commercial/contributions-utilities';
import type { Banner } from 'common/modules/ui/bannerPicker';

import { bannerTemplate as subscripionBannerTemplate } from './subscription-banner-template';
import { bannerTemplate as gwBannerTemplate } from './guardian-weekly-banner-template';
import { bannerTracking } from './subscription-banner-tracking';
import type { BannerTracking } from './subscription-banner-tracking';

const MESSAGE_CODE = 'subscription-banner';
const SUBSCRIPTION_BANNER_CLOSED_KEY = 'subscriptionBannerLastClosedAt';

const subscriptionBannerSwitchIsOn: boolean = config.get(
    'switches.subscriptionBanner'
);
const pageviews: number = local.get('gu.alreadyVisited');

const currentRegion: ReaderRevenueRegion = getReaderRevenueRegion(
    geolocationGetSync()
);

const hasAcknowledged = bannerRedeploymentDate => {
    const redeploymentDate = new Date(Number(bannerRedeploymentDate));
    const lastClosedAt = userPrefs.get(SUBSCRIPTION_BANNER_CLOSED_KEY);
    const lastClosedAtTime = new Date(lastClosedAt);

    // Always show to people who have never dismissed
    if (!lastClosedAt) {
        return false;
    }

    // Default to hiding when there is a problem with the redeploy - this is unexpected
    if (!redeploymentDate) {
        return true;
    }

    return lastClosedAtTime > redeploymentDate;
};

const selectorName = (bannerName: string) => (actionId: ?string) =>
    `#js-site-message--${bannerName}${actionId ? `__${actionId}` : ''}`;

const hasAcknowledgedBanner = region =>
    fetchJson(`/reader-revenue/subscriptions-banner-deploy-log/${region}`, {
        mode: 'cors',
    })
        .then(resp => hasAcknowledged(resp.time))
        .catch(err => {
            reportError(
                new Error(
                    `Unable to get subscriptions banner deploy log: ${err}`
                ),
                { feature: 'subscriptions-banner' },
                false
            );
            return true;
        });

const threeOrMorePageViews = (currentPageViews: number) =>
    currentPageViews >= 3;

const pageIsIdentity = (): boolean =>
    config.get('page.contentType') === 'Identity' ||
    config.get('page.section') === 'identity';

const bindClickHandler = (button, callback) => {
    if (button) {
        button.addEventListener('click', () => {
            callback(button);
        });
    }
};

const bindCloseHandler = (button, banner, callback) => {
    const ENTER_KEY_CODE = 'Enter';
    const removeBanner = () => {
        callback(SUBSCRIPTION_BANNER_CLOSED_KEY);
        if (banner) {
            banner.remove();
        }
    };

    if (button) {
        button.addEventListener('click', () => {
            removeBanner();
        });

        button.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.code === ENTER_KEY_CODE) {
                removeBanner();
            }
        });
    }
};

const bindCloseActions = (banner, callback) => buttons => {
    buttons.forEach(button => {
        bindCloseHandler(button, banner, callback);
    });
};

const bindClickHandlers = (
    bannerName: string,
    trackBannerClick: (button: any) => void,
    trackBannerCloseButtons: (button: any) => void
) => {
    const closeActions = (bannerCloseKey): void => {
        const closedAt = (lastClosedAtKey: string) =>
            userPrefs.set(lastClosedAtKey, new Date().toISOString());
        trackBannerCloseButtons();
        closedAt(bannerCloseKey);
    };

    const bannerSelector = selectorName(bannerName);

    const bannerHtml = document.querySelector(bannerSelector('holder'));

    const notNowButton = document.querySelector(bannerSelector('cta-dismiss'));

    const ctaButton = document.querySelector(bannerSelector('cta'));

    const closeButton = document.querySelector(bannerSelector('close-button'));

    const signInLink = document.querySelector(bannerSelector('sign-in'));

    const bindCloseButtons = bindCloseActions(bannerHtml, closeActions);

    if (bannerHtml) {
        bindCloseButtons([closeButton, notNowButton]);
        bindClickHandler(ctaButton, trackBannerClick);
        bindClickHandler(signInLink, trackBannerClick);
    }
};

const createBannerShow = (
    tracking: BannerTracking,
    bannerTemplate: (
        subscriptionUrl: string,
        signInUrl: string,
        userLoggedIn: boolean
    ) => string,
    userLoggedIn: boolean
) => async (): Promise<boolean> => {
    tracking.trackBannerView();
    tracking.gaTracking();

    if (document.body) {
        document.body.insertAdjacentHTML(
            'beforeend',
            bannerTemplate(
                tracking.subscriptionUrl,
                tracking.signInUrl,
                userLoggedIn
            )
        );
    }

    bindClickHandlers(
        MESSAGE_CODE,
        tracking.trackBannerClick,
        tracking.trackCloseButtons
    );

    return Promise.resolve(true);
};

const chooseBanner = (region: ReaderRevenueRegion) =>
    region === 'australia' ? gwBannerTemplate : subscripionBannerTemplate;

const show = createBannerShow(
    // bannerTracking(currentRegion),
    // chooseBanner(currentRegion),
    bannerTracking('australia'),
    chooseBanner('australia'),
    isUserLoggedIn()
);

const canShow: () => Promise<boolean> = async () => {
    const hasAcknowledgedSinceLastRedeploy = await hasAcknowledgedBanner(
        currentRegion
    );

    const can = Promise.resolve(
        threeOrMorePageViews(pageviews) &&
            !hasAcknowledgedSinceLastRedeploy &&
            !shouldHideSupportMessaging() &&
            !pageShouldHideReaderRevenue() &&
            subscriptionBannerSwitchIsOn &&
            !pageIsIdentity()
    );

    return can;
};

const subscriptionBanner: Banner = {
    id: MESSAGE_CODE,
    show,
    canShow,
};

export { subscriptionBanner, createBannerShow, selectorName };
