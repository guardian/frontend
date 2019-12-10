// @flow

import { trackNonClickInteraction } from 'common/modules/analytics/google';
import config from 'lib/config';
import userPrefs from 'common/modules/user-prefs';
import { local } from 'lib/storage';
import {
    submitViewEvent,
    submitClickEvent,
} from 'common/modules/commercial/acquisitions-ophan';
import { shouldHideSupportMessaging } from 'common/modules/commercial/user-features';
import {
    pageShouldHideReaderRevenue,
    getReaderRevenueRegion,
} from 'common/modules/commercial/contributions-utilities';
import {
    track as trackFirstPvConsent,
    canShow as canShowFirstPvConsent,
} from 'common/modules/ui/first-pv-consent-banner';
import {
    setAdConsentState,
    allAdConsents,
} from 'common/modules/commercial/ad-prefs.lib';
import { bannerTemplate } from 'common/modules/ui/subscription-banner-template';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { commercialConsentOptionsButton } from 'common/modules/experiments/tests/commercial-consent-options-button';
import { isUserLoggedIn } from 'common/modules/identity/api';
import fetchJson from 'lib/fetch-json';

// types
import type { ReaderRevenueRegion } from 'common/modules/commercial/contributions-utilities';
import type { Banner } from 'common/modules/ui/bannerPicker';

const ENTER_KEY_CODE = 'Enter';
const DISPLAY_EVENT_KEY = 'subscription-banner : display';
const MESSAGE_CODE = 'subscription-banner';
const SUBSCRIPTION_BANNER_CLOSED_KEY = 'subscriptionBannerLastClosedAt';
const COMPONENT_TYPE = 'ACQUISITIONS_SUBSCRIPTIONS_BANNER';
const OPHAN_EVENT_ID = 'acquisitions-subscription-banner';

const subscriptionHostname: string = config.get('page.supportUrl');
const signinHostname: string = config.get('page.idUrl');
const subscriptionBannerSwitchIsOn: boolean = config.get(
    'switches.subscriptionBanner'
);
const pageviews: number = local.get('gu.alreadyVisited');

const currentRegion: ReaderRevenueRegion = getReaderRevenueRegion(
    geolocationGetSync()
);
const hideBannerInTheseRegions: ReaderRevenueRegion[] = [
    'united-states',
    'australia',
];
const subscriptionUrl = `${subscriptionHostname}/subscribe/digital?INTCMP=gdnwb_copts_banner_subscribe_SubscriptionBanner&acquisitionData=%7B%22source%22%3A%22GUARDIAN_WEB%22%2C%22campaignCode%22%3A%22subscriptions_banner%22%2C%22componentType%22%3A%22${COMPONENT_TYPE}%22%2C%22componentId%22%3A%22${OPHAN_EVENT_ID}%22%7D`;
const signInUrl = `${signinHostname}/signin?utm_source=gdnwb&utm_medium=banner&utm_campaign=SubsBanner_Exisiting&CMP_TU=mrtn&CMP_BUNIT=subs`;

fetchJson(`/reader-revenue/subscriptions-banner-deploy-log/united-kingdom`, {
    mode: 'cors',
}).then((resp) => {
    console.log('res', {resp})
});

const canShowBannerInRegion = (region: ReaderRevenueRegion): boolean =>
    !hideBannerInTheseRegions.includes(region);

const fiveOrMorePageViews = (currentPageViews: number) => currentPageViews >= 5;

const closedAt = (lastClosedAtKey: string) =>
    userPrefs.set(lastClosedAtKey, new Date().toISOString());

const hasAcknowledged = () => {
    const bannerRedeploymentDate = new Date(2019, 11, 12, 5, 0).getTime(); // 2 Dec 2019 @ 5:00
    const lastClosedAt = userPrefs.get(SUBSCRIPTION_BANNER_CLOSED_KEY);
    const lastClosedAtTime = new Date(lastClosedAt).getTime();

    return lastClosedAt && lastClosedAtTime > bannerRedeploymentDate;
};

const subcriptionBannerCloseActions = (): void => {
    closedAt(SUBSCRIPTION_BANNER_CLOSED_KEY);
};

const pageIsIdentity = (): boolean => {
    const isIdentityPage =
        config.get('page.contentType') === 'Identity' ||
        config.get('page.section') === 'identity';
    return isIdentityPage;
};

const onAgree = (): void => {
    allAdConsents.forEach(_ => {
        setAdConsentState(_, true);
    });
};

const bindCloseHandler = (button, banner, callback) => {
    const removeBanner = () => {
        callback();
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

const bindClickHandler = (button, callback) => {
    if (button) {
        button.addEventListener('click', () => {
            callback();
        });
    }
};

const trackSubscriptionBannerView = () => {
    submitViewEvent({
        component: {
            componentType: COMPONENT_TYPE,
            id: OPHAN_EVENT_ID,
        },
    });
};

const trackSubscriptionBannerCtaClick = () => {
    submitClickEvent({
        component: {
            componentType: COMPONENT_TYPE,
            id: OPHAN_EVENT_ID,
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

    const bindSubscriptionCloseButtons = closeActions(
        subscriptionBannerHtml,
        subcriptionBannerCloseActions
    );

    if (subscriptionBannerHtml) {
        bindSubscriptionCloseButtons([
            subscriptionBannercloseButton,
            subscriptionBannerNotNowButton,
        ]);
        bindClickHandler(
            subscriptionBannerCta,
            trackSubscriptionBannerCtaClick
        );
    }
};

const bindConsentClickHandlers = () => {
    const consentBannerCloseButton = document.querySelector(
        '.site-message--first-pv-consent__button'
    );
    const consentBannerHtml = document.querySelector(
        '#js-first-pv-consent-site-message'
    );

    if (consentBannerHtml) {
        bindCloseHandler(consentBannerCloseButton, consentBannerHtml, onAgree);
    }
};

const show: () => Promise<boolean> = async () => {
    trackFirstPvConsent();
    trackSubscriptionBannerView();
    trackNonClickInteraction(DISPLAY_EVENT_KEY);

    const showConsent = await canShowFirstPvConsent();

    if (document.body) {
        document.body.insertAdjacentHTML(
            'beforeend',
            bannerTemplate(
                subscriptionUrl,
                signInUrl,
                showConsent,
                isUserLoggedIn()
            )
        );
    }

    bindConsentClickHandlers();
    bindSubscriptionClickHandlers();

    return Promise.resolve(true);
};

const canShow: () => Promise<boolean> = () => {
    const can = Promise.resolve(
        !isInVariantSynchronous(commercialConsentOptionsButton, 'control') &&
            !isInVariantSynchronous(
                commercialConsentOptionsButton,
                'variant'
            ) &&
            fiveOrMorePageViews(pageviews) &&
            !hasAcknowledged() &&
            !shouldHideSupportMessaging() &&
            !pageShouldHideReaderRevenue() &&
            canShowBannerInRegion(currentRegion) &&
            subscriptionBannerSwitchIsOn &&
            !pageIsIdentity()
    );
    return can;
};

export const firstPvConsentSubsciptionBanner: Banner = {
    id: MESSAGE_CODE,
    show,
    canShow,
};
