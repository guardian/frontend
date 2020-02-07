// @flow

import { trackNonClickInteraction } from 'common/modules/analytics/google';
import config from 'lib/config';
import userPrefs from 'common/modules/user-prefs';
import { local } from 'lib/storage';
import {
    submitViewEvent,
    submitClickEvent,
    addTrackingCodesToUrl,
} from 'common/modules/commercial/acquisitions-ophan';
import { shouldHideSupportMessaging } from 'common/modules/commercial/user-features';
import {
    pageShouldHideReaderRevenue,
    getReaderRevenueRegion,
} from 'common/modules/commercial/contributions-utilities';
import { bannerTemplate } from 'common/modules/ui/subscription-banner-template';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { isUserLoggedIn } from 'common/modules/identity/api';
import fetchJson from 'lib/fetch-json';
import reportError from 'lib/report-error';
import {
    isInVariantSynchronous,
    isInABTestSynchronous,
} from 'common/modules/experiments/ab';
import { subscriptionsBannerNewYearCopyTest } from 'common/modules/experiments/tests/subscriptions-banner-new-year-copy';

// types
import type { ReaderRevenueRegion } from 'common/modules/commercial/contributions-utilities';
import type { Banner } from 'common/modules/ui/bannerPicker';

const ENTER_KEY_CODE = 'Enter';
const DISPLAY_EVENT_KEY = 'subscription-banner : display';
const MESSAGE_CODE = 'subscription-banner';
const SUBSCRIPTION_BANNER_CLOSED_KEY = 'subscriptionBannerLastClosedAt';
const COMPONENT_TYPE = 'ACQUISITIONS_SUBSCRIPTIONS_BANNER';
const CLICK_EVENT_CTA = 'subscription-banner : cta';
const CLICK_EVENT_CLOSE_NOT_NOW = 'subscription-banner : not now';
const CLICK_EVENT_CLOSE_BUTTON = 'subscription-banner : close';
const CLICK_EVENT_SIGN_IN = 'subscription-banner : sign in';
const OPHAN_EVENT_ID = 'acquisitions-subscription-banner';
const CAMPAIGN_CODE = 'gdnwb_copts_banner_subscribe_SubscriptionBanner';

const subscriptionHostname: string = config.get('page.supportUrl');
const signinHostname: string = config.get('page.idUrl');
const subscriptionBannerSwitchIsOn: boolean = config.get(
    'switches.subscriptionBanner'
);
const pageviews: number = local.get('gu.alreadyVisited');

const currentRegion: ReaderRevenueRegion = getReaderRevenueRegion(
    geolocationGetSync()
);
const hideBannerInTheseRegions: ReaderRevenueRegion[] = ['australia'];

const abTest = isInABTestSynchronous(subscriptionsBannerNewYearCopyTest)
    ? {
          abTest: {
              name: subscriptionsBannerNewYearCopyTest.id,
              variant: isInVariantSynchronous(
                  subscriptionsBannerNewYearCopyTest,
                  'control'
              )
                  ? 'control'
                  : 'variant',
          },
      }
    : {};

const subscriptionUrl = addTrackingCodesToUrl({
    base: `${subscriptionHostname}/subscribe/digital`,
    componentType: COMPONENT_TYPE,
    componentId: OPHAN_EVENT_ID,
    campaignCode: CAMPAIGN_CODE,
    ...abTest,
});

const signInUrl = `${signinHostname}/signin?utm_source=gdnwb&utm_medium=banner&utm_campaign=SubsBanner_Exisiting&CMP_TU=mrtn&CMP_BUNIT=subs`;

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

const canShowBannerInRegion = (region: ReaderRevenueRegion): boolean =>
    !hideBannerInTheseRegions.includes(region);

const threeOrMorePageViews = (currentPageViews: number) =>
    currentPageViews >= 3;

const closedAt = (lastClosedAtKey: string) =>
    userPrefs.set(lastClosedAtKey, new Date().toISOString());

const subcriptionBannerCloseActions = (): void => {
    closedAt(SUBSCRIPTION_BANNER_CLOSED_KEY);
};

const pageIsIdentity = (): boolean => {
    const isIdentityPage =
        config.get('page.contentType') === 'Identity' ||
        config.get('page.section') === 'identity';
    return isIdentityPage;
};

const bindCloseHandler = (button, banner, callback) => {
    const removeBanner = () => {
        callback();
        if (banner) {
            submitClickEvent({
                component: {
                    componentType: COMPONENT_TYPE,
                    id:
                        button &&
                        button.id ===
                            'js-site-message--subscription-banner__close-button'
                            ? CLICK_EVENT_CLOSE_BUTTON
                            : CLICK_EVENT_CLOSE_NOT_NOW,
                },
            });
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

const bindClickHandler = (button, callback) => {
    if (button) {
        button.addEventListener('click', () => {
            callback(button);
        });
    }
};

const trackSubscriptionBannerView = () => {
    submitViewEvent({
        component: {
            componentType: COMPONENT_TYPE,
            id: CLICK_EVENT_CTA,
        },
    });
};

const trackSubscriptionBannerClick = button => {
    submitClickEvent({
        component: {
            componentType: COMPONENT_TYPE,
            id:
                button.id === 'js-site-message--subscription-banner__cta'
                    ? CLICK_EVENT_CTA
                    : CLICK_EVENT_SIGN_IN,
        },
    });
};

const closeActions = (banner, callback) => buttons => {
    buttons.forEach(button => {
        bindCloseHandler(button, banner, callback);
    });
};

const bindSubscriptionClickHandlers = () => {
    const subscriptionBannerNotNowButton = document.querySelector(
        '#js-site-message--subscription-banner__cta-dismiss'
    );

    const subscriptionBannerHtml = document.querySelector(
        '#js-subscription-banner-site-message'
    );

    const subscriptionBannerCta = document.querySelector(
        '#js-site-message--subscription-banner__cta'
    );

    const subscriptionBannercloseButton = document.querySelector(
        '#js-site-message--subscription-banner__close-button'
    );

    const subscriptionBannerSignIn = document.querySelector(
        '#site-message--subscription-banner__sign-in'
    );

    const bindSubscriptionCloseButtons = closeActions(
        subscriptionBannerHtml,
        subcriptionBannerCloseActions
    );

    if (subscriptionBannerHtml) {
        bindSubscriptionCloseButtons([
            subscriptionBannercloseButton,
            subscriptionBannerNotNowButton,
        ]);
        bindClickHandler(subscriptionBannerCta, trackSubscriptionBannerClick);
        bindClickHandler(
            subscriptionBannerSignIn,
            trackSubscriptionBannerClick
        );
    }
};

const show: () => Promise<boolean> = async () => {
    trackSubscriptionBannerView();
    trackNonClickInteraction(DISPLAY_EVENT_KEY);

    if (document.body) {
        document.body.insertAdjacentHTML(
            'beforeend',
            bannerTemplate(
                subscriptionUrl,
                signInUrl,
                isUserLoggedIn(),
                isInVariantSynchronous(
                    subscriptionsBannerNewYearCopyTest,
                    'variant'
                ) || !isInABTestSynchronous(subscriptionsBannerNewYearCopyTest)
            )
        );
    }

    bindSubscriptionClickHandlers();

    return Promise.resolve(true);
};

const canShow: () => Promise<boolean> = async () => {
    const hasAcknowledgedSinceLastRedeploy = await hasAcknowledgedBanner(
        currentRegion
    );

    const can = Promise.resolve(
        threeOrMorePageViews(pageviews) &&
            !hasAcknowledgedSinceLastRedeploy &&
            !shouldHideSupportMessaging() &&
            !pageShouldHideReaderRevenue() &&
            canShowBannerInRegion(currentRegion) &&
            subscriptionBannerSwitchIsOn &&
            !pageIsIdentity()
    );

    return can;
};

export const subscriptionBanner: Banner = {
    id: MESSAGE_CODE,
    show,
    canShow,
};
