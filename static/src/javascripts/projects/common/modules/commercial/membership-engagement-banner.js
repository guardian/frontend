// @flow
import config from 'lib/config';
import { local } from 'lib/storage';
import { Message } from 'common/modules/ui/message';
import mediator from 'lib/mediator';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import {
    defaultEngagementBannerParams,
    getControlEngagementBannerParams,
} from 'common/modules/commercial/membership-engagement-banner-parameters';
import { isBlocked } from 'common/modules/commercial/membership-engagement-banner-block';
import {
    type ReaderRevenueRegion,
    pageShouldHideReaderRevenue,
    getReaderRevenueRegion,
} from 'common/modules/commercial/contributions-utilities';
import { userIsSupporter } from 'common/modules/commercial/user-features';
import type { Banner } from 'common/modules/ui/bannerPicker';
import bean from 'bean';
import fetchJson from 'lib/fetch-json';
import reportError from 'lib/report-error';

import {
    submitComponentEvent,
    addTrackingCodesToUrl,
} from 'common/modules/commercial/acquisitions-ophan';
import { acquisitionsBannerControlTemplate } from 'common/modules/commercial/templates/acquisitions-banner-control';
import userPrefs from 'common/modules/user-prefs';
import { initTicker } from 'common/modules/commercial/ticker';
import { getEngagementBannerTestToRun } from 'common/modules/experiments/ab';

type BannerDeployLog = {
    time: string,
};

const messageCode = 'engagement-banner';
const minArticlesBeforeShowingBanner = 3;

const lastClosedAtKey = 'engagementBannerLastClosedAt';

const getTimestampOfLastBannerDeployForLocation = (
    region: ReaderRevenueRegion
): Promise<string> =>
    fetchJson(`/reader-revenue/contributions-banner-deploy-log/${region}`, {
        mode: 'cors',
    }).then((resp: BannerDeployLog) => resp && resp.time);

const hasBannerBeenRedeployedSinceClosed = (
    userLastClosedBannerAt: string,
    region: ReaderRevenueRegion
): Promise<boolean> =>
    getTimestampOfLastBannerDeployForLocation(region)
        .then(timestamp => {
            const bannerLastDeployedAt = new Date(timestamp);
            return bannerLastDeployedAt > new Date(userLastClosedBannerAt);
        })
        .catch(err => {
            // Capture in sentry
            reportError(
                new Error(
                    `Unable to get contributions banner deploy log: ${err}`
                ),
                { feature: 'reader-revenue-contributions-banner' },
                false
            );
            return false;
        });

const deriveBannerParams = (
    testToRun: ?Runnable<AcquisitionsABTest>
): Promise<EngagementBannerParams> => {
    const defaultParams: EngagementBannerParams = defaultEngagementBannerParams();

    if (testToRun) {
        return Promise.resolve({
            ...defaultParams,
            ...testToRun.variantToRun.engagementBannerParams,
            campaignCode: `${testToRun.id}_${testToRun.variantToRun.id}`,
        });
    }

    // if the user isn't in a test variant, use the control in google docs
    return getControlEngagementBannerParams().then(controlParams => ({
        ...defaultParams,
        ...controlParams,
    })).catch(() => {
        console.log('caught');
        // TODO: move to getControlEngagementBannerParams()
        // and if that fails too, just use the hardcoded params
        return defaultParams;
    });
}

const getVisitCount = (): number => local.get('gu.alreadyVisited') || 0;

const selectSequentiallyFrom = (array: Array<string>): string =>
    array[getVisitCount() % array.length];

const hideBanner = (banner: Message) => {
    banner.hide();

    // Store timestamp in localStorage
    userPrefs.set(lastClosedAtKey, new Date().toISOString());
};

const clearBannerHistory = (): void => {
    userPrefs.remove(lastClosedAtKey);
};

const showBanner = (
    params: EngagementBannerParams,
    runningBannerTest: ?Runnable<AcquisitionsABTest>
): void => {
    const messageText = Array.isArray(params.messageText)
        ? selectSequentiallyFrom(params.messageText)
        : params.messageText;
    const ctaText = params.ctaText;

    const linkUrl = addTrackingCodesToUrl({
        base: params.linkUrl,
        componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
        componentId: params.campaignCode,
        campaignCode: params.campaignCode,
        abTest: runningBannerTest
            ? {
                  name: runningBannerTest.id,
                  variant: runningBannerTest.variantToRun.id,
              }
            : undefined,
    });
    const buttonCaption = params.buttonCaption;
    const templateParams = {
        messageText,
        ctaText,
        linkUrl,
        buttonCaption,
        hasTicker: params.hasTicker,
    };

    const renderedBanner: string = params.template
        ? params.template(templateParams)
        : acquisitionsBannerControlTemplate(templateParams);
    const messageShown = new Message(messageCode, {
        siteMessageLinkName: 'membership message',
        siteMessageCloseBtn: 'hide',
        siteMessageComponentName: params.campaignCode,
        trackDisplay: true,
        cssModifierClass: params.bannerModifierClass || 'engagement-banner',
        customJs() {
            bean.on(
                document,
                'click',
                '.js-engagement-banner-close-button',
                () => hideBanner(this)
            );
        },
    }).show(renderedBanner);

    if (messageShown) {
        ['INSERT', 'VIEW'].forEach(action => {
            submitComponentEvent({
                component: {
                    componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
                    products: params.products,
                    campaignCode: params.campaignCode,
                    id: params.campaignCode,
                },
                action,
                ...(runningBannerTest
                    ? {
                          abTest: {
                              name: runningBannerTest.id,
                              variant: runningBannerTest.variantToRun.id,
                          },
                      }
                    : {}),
            });
        });

        if (params.hasTicker) {
            initTicker('.js-engagement-banner-ticker');
        }

        mediator.emit('membership-message:display');
    }
};

const show = (): Promise<boolean> =>
    getEngagementBannerTestToRun()
        .then(testToRun =>
            deriveBannerParams(testToRun).then(params => {
                showBanner(params, testToRun);
                return true;
            })
        )
        .catch(() => false);

const canShow = (): Promise<boolean> => {
    if (!config.get('switches.membershipEngagementBanner') || isBlocked()) {
        return Promise.resolve(false);
    }

    const userHasSeenEnoughArticles: boolean =
        getVisitCount() >= minArticlesBeforeShowingBanner;
    const userAlreadyGivesUsMoney = userIsSupporter();
    const bannerIsBlockedForEditorialReasons = pageShouldHideReaderRevenue();

    if (
        userHasSeenEnoughArticles &&
        !userAlreadyGivesUsMoney &&
        !bannerIsBlockedForEditorialReasons
    ) {
        const userLastClosedBannerAt = userPrefs.get(lastClosedAtKey);

        if (!userLastClosedBannerAt) {
            // show the banner if we can't get a value for this
            return Promise.resolve(true);
        }

        return hasBannerBeenRedeployedSinceClosed(
            userLastClosedBannerAt,
            getReaderRevenueRegion(geolocationGetSync())
        );
    }
    return Promise.resolve(false);
};

const membershipEngagementBanner: Banner = {
    id: messageCode,
    show,
    canShow,
};

export {
    membershipEngagementBanner,
    canShow,
    messageCode,
    hideBanner,
    clearBannerHistory,
    minArticlesBeforeShowingBanner,
    deriveBannerParams,
};
