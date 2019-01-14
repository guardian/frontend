// @flow
import defaultConfig from 'lib/config';
import { getBreakpoint } from 'lib/detect';
import { isAdFreeUser } from 'common/modules/commercial/user-features';
import { isUserLoggedIn } from 'common/modules/identity/api';
import userPrefs from 'common/modules/user-prefs';

// Having a constructor means we can easily re-instantiate the object in a test
class CommercialFeatures {
    dfpAdvertising: boolean;
    stickyTopBannerAd: boolean;
    articleBodyAdverts: boolean;
    articleAsideAdverts: boolean;
    carrotTrafficDriver: boolean;
    videoPreRolls: boolean;
    highMerch: boolean;
    thirdPartyTags: boolean;
    outbrain: boolean;
    commentAdverts: boolean;
    liveblogAdverts: boolean;
    paidforBand: boolean;
    asynchronous: boolean;
    adFree: boolean;

    constructor(config: any = defaultConfig) {
        // this is used for SpeedCurve tests
        const noadsUrl: boolean = /[#&]noads(&.*)?$/.test(window.location.hash);
        const forceAdFree: boolean = /[#&]noadsaf(&.*)?$/.test(
            window.location.hash
        );
        const forceAds: boolean = /[?&]forceads(&.*)?$/.test(
            window.location.search
        );
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
        this.adFree = !!forceAdFree || isAdFreeUser();

        this.dfpAdvertising =
            forceAds ||
            (switches.commercial &&
                externalAdvertising &&
                !sensitiveContent &&
                !isIdentityPage);

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
            !this.adFree &&
            this.articleBodyAdverts &&
            config.get('switches.carrotTrafficDriver', false) &&
            !config.page.isPaidContent;

        this.videoPreRolls = this.dfpAdvertising && !this.adFree;

        this.highMerch =
            this.dfpAdvertising &&
            !this.adFree &&
            !isMinuteArticle &&
            !isHosted &&
            !isInteractive &&
            !config.page.isFront &&
            !newRecipeDesign;

        this.thirdPartyTags =
            externalAdvertising && !isIdentityPage && !isSecureContact;

        this.outbrain =
            this.dfpAdvertising &&
            !this.adFree &&
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
            (!isLiveBlog || isWidePage);

        this.liveblogAdverts =
            isLiveBlog && this.dfpAdvertising && !this.adFree;

        this.paidforBand = config.page.isPaidContent && !supportsSticky;
    }
}

export const commercialFeatures = new CommercialFeatures();
