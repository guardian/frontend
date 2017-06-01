// @flow
import config from 'lib/config';
import detect from 'lib/detect';
import { logError } from 'lib/robust';
import userFeatures from 'commercial/modules/user-features';
import identityApi from 'common/modules/identity/api';
import userPrefs from 'common/modules/user-prefs';

// Having a constructor means we can easily re-instantiate the object in a test
class CommercialFeatures {
    dfpAdvertising: any;
    stickyTopBannerAd: any;
    articleBodyAdverts: any;
    articleAsideAdverts: any;
    videoPreRolls: any;
    highMerch: any;
    thirdPartyTags: any;
    outbrain: any;
    commentAdverts: any;
    liveblogAdverts: any;
    paidforBand: any;
    canReasonablyAskForMoney: any;
    asynchronous: any;
    adFeedback: any;
    adFree: any;

    constructor() {
        // this is used for SpeedCurve tests
        const noadsUrl = window.location.hash.match(/[#&]noads(&.*)?$/);
        const externalAdvertising = !noadsUrl && !userPrefs.isOff('adverts');
        const sensitiveContent =
            config.page.shouldHideAdverts ||
            config.page.section === 'childrens-books-site';
        const isMinuteArticle = config.page.isMinuteArticle;
        const isArticle = config.page.contentType === 'Article';
        const isInteractive = config.page.contentType === 'Interactive';
        const isLiveBlog = config.page.isLiveBlog;
        const isHosted = config.page.isHosted;
        const isMatchReport = config.hasTone('Match reports');
        const isIdentityPage =
            config.page.contentType === 'Identity' ||
            config.page.section === 'identity'; // needed for pages under profile.* subdomain
        const switches = config.switches;
        const isWidePage = detect.getBreakpoint() === 'wide';
        const supportsSticky =
            document.documentElement &&
            document.documentElement.classList.contains('has-sticky');
        const newRecipeDesign =
            config.page.showNewRecipeDesign && config.tests.abNewRecipeDesign;

        // Feature switches
        this.adFree =
            switches.commercial &&
            switches.adFreeMembershipTrial &&
            userFeatures.isAdFreeUser();

        this.dfpAdvertising =
            switches.commercial && externalAdvertising && !sensitiveContent;

        this.stickyTopBannerAd =
            !this.adFree &&
            !config.page.disableStickyTopBanner &&
            !supportsSticky;

        this.articleBodyAdverts =
            this.dfpAdvertising &&
            !this.adFree &&
            !isMinuteArticle &&
            isArticle &&
            !isLiveBlog &&
            !isHosted &&
            !newRecipeDesign;

        this.articleAsideAdverts =
            this.dfpAdvertising &&
            !this.adFree &&
            !isMinuteArticle &&
            !isMatchReport &&
            !!(isArticle || isLiveBlog) &&
            !newRecipeDesign;

        this.videoPreRolls = this.dfpAdvertising && !this.adFree;

        this.highMerch =
            this.dfpAdvertising &&
            !isMinuteArticle &&
            !isHosted &&
            !isInteractive &&
            !config.page.isFront &&
            !newRecipeDesign;

        this.thirdPartyTags = externalAdvertising && !isIdentityPage;

        this.outbrain =
            this.dfpAdvertising &&
            switches.outbrain &&
            !noadsUrl &&
            !sensitiveContent &&
            isArticle &&
            !config.page.isPreview &&
            config.page.showRelatedContent &&
            !(identityApi.isUserLoggedIn() && config.page.commentable);

        this.commentAdverts =
            this.dfpAdvertising &&
            !this.adFree &&
            !isMinuteArticle &&
            config.switches.discussion &&
            config.page.commentable &&
            identityApi.isUserLoggedIn() &&
            (!isLiveBlog || isWidePage);

        this.liveblogAdverts =
            isLiveBlog && this.dfpAdvertising && !this.adFree;

        this.paidforBand =
            config.page.isPaidContent &&
            !config.page.hasSuperStickyBanner &&
            !supportsSticky;

        this.canReasonablyAskForMoney = !(userFeatures.isPayingMember() || // eg become a supporter, give a contribution
            config.page.shouldHideAdverts ||
            config.page.isPaidContent);

        this.asynchronous = {
            canDisplayMembershipEngagementBanner: detect.adblockInUse.then(
                adblockUsed => !adblockUsed && this.canReasonablyAskForMoney
            ),
        };

        this.adFeedback =
            config.switches.adFeedback &&
            ['artanddesign', 'society', 'tv-and-radio'].indexOf(
                config.page.section
            ) > -1;
    }
}

let commercialFeaturesExport;

try {
    config.commercial = config.commercial || {};
    config.commercial.featuresDebug = new CommercialFeatures();
    commercialFeaturesExport = config.commercial.featuresDebug;
} catch (error) {
    commercialFeaturesExport = {};
    logError('cm-commercialFeatures', error);
}

export const commercialFeatures = commercialFeaturesExport;
