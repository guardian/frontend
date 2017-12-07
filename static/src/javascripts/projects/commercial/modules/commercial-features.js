// @flow
import defaultConfig from 'lib/config';
import { getBreakpoint, adblockInUse } from 'lib/detect';
import { isAdFreeUser } from 'commercial/modules/user-features';
import { isUserLoggedIn } from 'common/modules/identity/api';
import userPrefs from 'common/modules/user-prefs';
import { shouldShowReaderRevenue } from 'common/modules/commercial/contributions-utilities';

// Having a constructor means we can easily re-instantiate the object in a test
class CommercialFeatures {
    dfpAdvertising: any;
    stickyTopBannerAd: any;
    articleBodyAdverts: any;
    articleAsideAdverts: any;
    carrotTrafficDriver: any;
    videoPreRolls: any;
    highMerch: any;
    thirdPartyTags: any;
    outbrain: any;
    commentAdverts: any;
    liveblogAdverts: any;
    paidforBand: any;
    asynchronous: any;
    adFeedback: any;
    adFree: any;

    constructor(config: any = defaultConfig) {
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
        const isIdentityPage =
            config.page.contentType === 'Identity' ||
            config.page.section === 'identity'; // needed for pages under profile.* subdomain
        const switches = config.switches;
        const isWidePage = getBreakpoint() === 'wide';
        const supportsSticky =
            document.documentElement &&
            document.documentElement.classList.contains('has-sticky');
        const newRecipeDesign =
            config.page.showNewRecipeDesign && config.tests.abNewRecipeDesign;
        const isSecureContact = config
            .get('page.pageId', '')
            .includes(
                'help/ng-interactive/2017/mar/17/contact-the-guardian-securely'
            );

        // Feature switches
        this.adFree =
            switches.commercial &&
            switches.adFreeSubscriptionTrial &&
            isAdFreeUser();

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

        this.carrotTrafficDriver =
            this.articleBodyAdverts &&
            config.get('switches.carrotTrafficDriver', false) &&
            config.hasTone('Features') &&
            !config.page.isPaidContent &&
            ['sport', 'lifeandstyle', 'fashion', 'football', 'travel'].includes(
                config.get('page.section')
            );

        this.videoPreRolls = this.dfpAdvertising && !this.adFree;

        this.highMerch =
            this.dfpAdvertising &&
            !isMinuteArticle &&
            !isHosted &&
            !isInteractive &&
            !config.page.isFront &&
            !newRecipeDesign;

        this.thirdPartyTags =
            externalAdvertising && !isIdentityPage && !isSecureContact;

        this.outbrain =
            this.dfpAdvertising &&
            switches.outbrain &&
            !noadsUrl &&
            !sensitiveContent &&
            isArticle &&
            !config.page.isPreview &&
            config.page.showRelatedContent &&
            !(isUserLoggedIn() && config.page.commentable);

        this.commentAdverts =
            this.dfpAdvertising &&
            !this.adFree &&
            !isMinuteArticle &&
            config.switches.enableDiscussionSwitch &&
            config.page.commentable &&
            isUserLoggedIn() &&
            (!isLiveBlog || isWidePage);

        this.liveblogAdverts =
            isLiveBlog && this.dfpAdvertising && !this.adFree;

        this.paidforBand =
            config.page.isPaidContent &&
            !config.page.hasSuperStickyBanner &&
            !supportsSticky;

        this.asynchronous = {
            canDisplayMembershipEngagementBanner: adblockInUse.then(
                adblockUsed => !adblockUsed && shouldShowReaderRevenue()
            ),
        };

        this.adFeedback = false;
    }
}

export const commercialFeatures = new CommercialFeatures();
