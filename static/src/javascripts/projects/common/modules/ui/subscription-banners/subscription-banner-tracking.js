// @flow
import {
    submitViewEvent,
    submitClickEvent,
    addTrackingCodesToUrl,
} from 'common/modules/commercial/acquisitions-ophan';
import config from 'lib/config';
import { trackNonClickInteraction } from 'common/modules/analytics/google';

// types
import type { ReaderRevenueRegion } from 'common/modules/commercial/contributions-utilities';

export type BannerTracking = {
    signInUrl: string,
    gaTracking: () => any,
    subscriptionUrl: string,
    trackBannerView: () => void,
    trackBannerClick: (button: any) => void,
    trackCloseButtons: (button: any) => void,
};

const DISPLAY_EVENT_KEY = 'subscription-banner : display';
const COMPONENT_TYPE = 'ACQUISITIONS_SUBSCRIPTIONS_BANNER';
const CLICK_EVENT_CTA = 'subscription-banner : cta';
const CLICK_EVENT_CLOSE_NOT_NOW = 'subscription-banner : not now';
const CLICK_EVENT_CLOSE_BUTTON = 'subscription-banner : close';
const CLICK_EVENT_SIGN_IN = 'subscription-banner : sign in';
const OPHAN_EVENT_ID = 'acquisitions-subscription-banner';
const CAMPAIGN_CODE = 'gdnwb_copts_banner_subscribe_SubscriptionBanner_digital';
const AUS_CAMPAIGN_CODE =
    'gdnwb_copts_banner_subscribe_SubscriptionBanner_gWeekly';

const subscriptionHostname: string = config.get('page.supportUrl');
const signinHostname: string = config.get('page.idUrl');

const createTracking = (
    region: ReaderRevenueRegion,
    defaultTracking: BannerTracking
) => {
    const isAustralianRegion = region === 'australia';

    const australianTracking = {
        signInUrl: `${signinHostname}/signin?utm_source=gdnwb&utm_medium=banner&utm_campaign=SubsBanner_gWeekly&CMP_TU=mrtn&CMP_BUNIT=subs`,
        subscriptionUrl: addTrackingCodesToUrl({
            base: `${subscriptionHostname}/subscribe/digital`,
            componentType: COMPONENT_TYPE,
            componentId: OPHAN_EVENT_ID,
            campaignCode: AUS_CAMPAIGN_CODE,
        }),
    };

    return isAustralianRegion
        ? { ...defaultTracking, ...australianTracking }
        : defaultTracking;
};

export const bannerTracking = (region: ReaderRevenueRegion) => {
    const defaultTracking = {
        signInUrl: `${signinHostname}/signin?utm_source=gdnwb&utm_medium=banner&utm_campaign=SubsBanner_Existing&CMP_TU=mrtn&CMP_BUNIT=subs`,
        gaTracking: () => trackNonClickInteraction(DISPLAY_EVENT_KEY),
        subscriptionUrl: addTrackingCodesToUrl({
            base: `${subscriptionHostname}/subscribe/digital`,
            componentType: COMPONENT_TYPE,
            componentId: OPHAN_EVENT_ID,
            campaignCode: CAMPAIGN_CODE,
        }),

        trackBannerView: () => {
            submitViewEvent({
                component: {
                    componentType: COMPONENT_TYPE,
                    id: CLICK_EVENT_CTA,
                },
            });
        },
        trackBannerClick: button => {
            submitClickEvent({
                component: {
                    componentType: COMPONENT_TYPE,
                    id:
                        button.id ===
                        'js-site-message--subscription-banner__cta'
                            ? CLICK_EVENT_CTA
                            : CLICK_EVENT_SIGN_IN,
                },
            });
        },
        trackCloseButtons: button => {
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
        },
    };

    return createTracking(region, defaultTracking);
};
