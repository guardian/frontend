// @flow
import config from 'lib/config';
import { isBlocked } from 'common/modules/commercial/membership-engagement-banner-block';
import { shouldShowReaderRevenue } from 'common/modules/commercial/contributions-utilities';
import type { Banner } from 'common/modules/ui/bannerPicker';
import { acquisitionsBannerFivTemplate } from 'common/modules/commercial/templates/acquisitions-banner-fiv';
import userPrefs from 'common/modules/user-prefs';
import { getSync as getGeoLocation } from 'lib/geolocation';
import {
    supportContributeURL,
    supportSubscribeURL,
} from 'common/modules/commercial/support-utilities';
import {
    addTrackingCodesToUrl,
    submitComponentEvent,
} from 'common/modules/commercial/acquisitions-ophan';
import { Message } from 'common/modules/ui/message';
import bean from 'bean';
import mediator from 'lib/mediator';

const messageCode = 'fiv-banner';
const maxArticles = 3;
const fivImpressionsRemainingKey = 'fivImpressionsRemaining2';

const hideBanner = (banner: Message) => {
    banner.hide();
    userPrefs.set(fivImpressionsRemainingKey, 0);
};

const defaultEngagementBannerParams = () => ({
    campaignCode: 'onemillion',
    pageviewId: config.get('ophan.pageViewId', 'not_found'),
    products: ['CONTRIBUTION', 'RECURRING_CONTRIBUTION'],
    linkUrl: supportContributeURL,
    hideBanner,
    buttonCaption: 'n/a',
    ctaText: 'n/a',
    messageText: 'n/a',
});

const componentId = 'onemillion_fiv';

const getBannerHtml = (params: EngagementBannerParams) => {
    // hack to decrement, that makes this function not a pure function
    const fivImpressionsRemaining = userPrefs.get(fivImpressionsRemainingKey);

    if (fivImpressionsRemaining == null) {
        userPrefs.set(fivImpressionsRemainingKey, maxArticles - 1);
    } else if (fivImpressionsRemaining > 0) {
        const notSeenEnoughTimesYet = fivImpressionsRemaining > 0;
        if (notSeenEnoughTimesYet) {
            userPrefs.set(
                fivImpressionsRemainingKey,
                fivImpressionsRemaining - 1
            );
        }
    }

    const linkUrl = addTrackingCodesToUrl({
        base: params.linkUrl,
        componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
        componentId,
        campaignCode: params.campaignCode,
    });
    const subscribeUrl = addTrackingCodesToUrl({
        base: supportSubscribeURL,
        componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
        componentId,
        campaignCode: params.campaignCode,
    });

    const location = getGeoLocation();
    return acquisitionsBannerFivTemplate(location, linkUrl, subscribeUrl);
};

const showBanner = (params: EngagementBannerParams): void => {
    const renderedBanner = getBannerHtml(params);

    const messageShown = new Message(messageCode, {
        siteMessageLinkName: 'membership message',
        siteMessageCloseBtn: 'hide',
        siteMessageComponentName: params.campaignCode,
        trackDisplay: true,
        cssModifierClass: 'fiv-banner',
        customJs() {
            bean.on(document, 'click', '.js-fiv-banner-close-button', () =>
                hideBanner(this)
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
            });
        });

        mediator.emit('membership-message:display');
    }
};

const show = (): Promise<boolean> => {
    const params = defaultEngagementBannerParams();

    if (params) {
        showBanner(params);
        return Promise.resolve(true);
    }
    return Promise.resolve(false);
};

const canShow = (): Promise<boolean> => {
    // always show if they put #fiv in the url hash
    if (window.location.hash.match(/[#&]fiv(&.*)?$/)) {
        return Promise.resolve(true);
    }

    if (!window.location.hash.match(/[#&]fivtest(&.*)?$/)) {
        if (
            !config.get('switches.fivBanner') ||
            isBlocked() /* not important but see pr#17062 */
        ) {
            return Promise.resolve(false);
        }
    }

    if (shouldShowReaderRevenue(true)) {
        const fivImpressionsRemaining = userPrefs.get(
            fivImpressionsRemainingKey
        );

        if (fivImpressionsRemaining == null) {
            userPrefs.set(fivImpressionsRemainingKey, maxArticles);
            const tryReadingBack = userPrefs.get(fivImpressionsRemainingKey);
            return Promise.resolve(tryReadingBack != null);
        } else if (fivImpressionsRemaining > 0) {
            const notSeenEnoughTimesYet = fivImpressionsRemaining > 0;
            return Promise.resolve(notSeenEnoughTimesYet);
        }
        return Promise.resolve(false);
    }
    return Promise.resolve(false);
};

const fivBanner: Banner = {
    id: messageCode,
    show,
    canShow,
};

export {
    fivBanner,
    canShow,
    messageCode,
    defaultEngagementBannerParams,
    getBannerHtml,
    hideBanner,
};
