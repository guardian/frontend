// @flow
import config from 'lib/config';
import { local } from 'lib/storage';
import { isBlocked } from 'common/modules/commercial/membership-engagement-banner-block';
import { shouldShowReaderRevenue } from 'common/modules/commercial/contributions-utilities';
import type { Banner } from 'common/modules/ui/bannerPicker';
import { acquisitionsBannerFivTemplate } from 'common/modules/commercial/templates/acquisitions-banner-fiv';
import userPrefs from 'common/modules/user-prefs';
import {getSync as getGeoLocation} from "../../../../lib/geolocation";
import {supportContributeURL} from "common/modules/commercial/support-utilities";
import {addTrackingCodesToUrl, submitComponentEvent} from "common/modules/commercial/acquisitions-ophan";
import {Message} from "common/modules/ui/message";
import bean from "bean";
import mediator from "../../../../lib/mediator";

const messageCode = 'fiv-banner';
const maxArticles = 3;
const fivFirstSeenAtKey = 'fivFirstSeenAt';

const getVisitCount = (): number => local.get('gu.alreadyVisited') || 0;

const defaultEngagementBannerParams = () => {
    const linkUrl = "https://www.theguardian.com/"; // FIXME

    return {
        campaignCode: 'gdnwb_copts_fiv_banner',
        pageviewId: config.get('ophan.pageViewId', 'not_found'),
        products: ['CONTRIBUTION', 'RECURRING_CONTRIBUTION'],
        linkUrl: supportContributeURL,
        hideBanner: hideBanner,
    };
};

const hideBanner = () => {
    userPrefs.set(fivFirstSeenAtKey, maxArticles * -1);
};

const showBanner = (params: EngagementBannerParams): void => {

    const linkUrl = addTrackingCodesToUrl({
        base: params.linkUrl,
        componentType: 'ACQUISITIONS_ENGAGEMENT_BANNER',
        componentId: params.campaignCode,
        campaignCode: params.campaignCode,
    });

    const location = getGeoLocation();
    const renderedBanner: string = acquisitionsBannerFivTemplate(location, linkUrl);
    const messageShown = new Message(messageCode, {
        siteMessageLinkName: 'membership message',
        siteMessageCloseBtn: 'hide',
        siteMessageComponentName: params.campaignCode,
        trackDisplay: true,
        cssModifierClass: 'fiv-banner',
        customJs() {
            bean.on(
                document,
                'click',
                '.js-fiv-banner-close-button',
                () => {
                    this.hide();
                    hideBanner();
                }
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
        console.log("fiv force ON");
        return Promise.resolve(true);
    }

    if (!config.get('switches.fivBanner')/*TODO create the switch*/ || isBlocked()/*TODO CHECK THIS*/) {
        return Promise.resolve(false);
    }

    if (
        shouldShowReaderRevenue()
    ) {
        const fivFirstSeenAt = userPrefs.get(
            fivFirstSeenAtKey
        );
        const visitCount = getVisitCount();

        if (!fivFirstSeenAt) {
            userPrefs.set(fivFirstSeenAtKey, visitCount);
            return Promise.resolve(true);
        } else {
            const notSeenEnoughTimesYet = (visitCount - fivFirstSeenAt) < maxArticles;
            return Promise.resolve(notSeenEnoughTimesYet);
        }
    }
    return Promise.resolve(false);
};

const fivBanner: Banner = {
    id: messageCode,
    show,
    canShow,
};

export { fivBanner, canShow, messageCode };
