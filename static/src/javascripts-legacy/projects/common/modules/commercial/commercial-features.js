define([
    'common/utils/location',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/robust',
    'common/modules/commercial/user-features',
    'common/modules/identity/api',
    'common/modules/user-prefs'
], function (
    location,
    config,
    detect,
    robust,
    userFeatures,
    identityApi,
    userPrefs
) {
    // Having a constructor means we can easily re-instantiate the object in a test
    function CommercialFeatures() {
        var self = this;

        // this is used for SpeedCurve tests
        var noadsUrl = location.getHash().match(/[#&]noads(&.*)?$/);

        var externalAdvertising =
            !noadsUrl &&
            !userPrefs.isOff('adverts');

        var sensitiveContent =
            config.page.shouldHideAdverts ||
            config.page.section === 'childrens-books-site';

        var isMinuteArticle = config.page.isMinuteArticle;

        var isArticle = config.page.contentType === 'Article';

        var isInteractive = config.page.contentType === 'Interactive';

        var isGallery = config.page.contentType == 'Gallery';

        var isLiveBlog = config.page.isLiveBlog;

        var isHosted = config.page.isHosted;

        var isMatchReport = config.hasTone('Match reports');

        var isIdentityPage =
            config.page.contentType === 'Identity' ||
            config.page.section === 'identity'; // needed for pages under profile.* subdomain

        var switches = config.switches;

        var isWidePage = detect.getBreakpoint() === 'wide';

        var supportsSticky = document.documentElement.classList.contains('has-sticky');

        // Feature switches

        this.dfpAdvertising =
            externalAdvertising &&
            !sensitiveContent;

        this.topBannerAd =
            this.dfpAdvertising &&
            !isMinuteArticle;

        this.stickyTopBannerAd =
            this.topBannerAd &&
            !config.page.disableStickyTopBanner &&
            !supportsSticky;

        this.galleryAdverts =
            this.dfpAdvertising &&
            isGallery;

        this.articleBodyAdverts =
            this.dfpAdvertising &&
            !isMinuteArticle &&
            isArticle &&
            !isLiveBlog &&
            !isHosted &&
            switches.commercial;

        this.articleAsideAdverts =
            this.dfpAdvertising &&
            !isMinuteArticle &&
            !isMatchReport &&
            !!(isArticle || isLiveBlog) &&
            switches.commercial;

        this.sliceAdverts =
            this.dfpAdvertising &&
            config.page.isFront &&
            switches.commercial;

        this.popularContentMPU =
            this.dfpAdvertising &&
            !isMinuteArticle;

        this.videoPreRolls =
            externalAdvertising &&
            !sensitiveContent &&
            switches.commercial;

        this.highMerch =
            this.dfpAdvertising &&
            !isMinuteArticle &&
            !isHosted &&
            !isInteractive &&
            !config.page.isFront &&
            switches.commercial;

        this.thirdPartyTags =
            externalAdvertising &&
            !isIdentityPage;

        this.outbrain =
            externalAdvertising &&
            !sensitiveContent &&
            switches.outbrain &&
            isArticle &&
            !config.page.isPreview &&
            config.page.showRelatedContent;

        this.commentAdverts =
            this.dfpAdvertising &&
            switches.commercial &&
            !isMinuteArticle &&
            config.switches.discussion &&
            config.page.commentable &&
            identityApi.isUserLoggedIn() &&
            (!isLiveBlog || isWidePage);

        this.liveblogAdverts =
            isLiveBlog &&
            this.dfpAdvertising &&
            switches.commercial;

        this.paidforBand =
            config.page.isAdvertisementFeature &&
            !config.page.hasSuperStickyBanner &&
            !supportsSticky;

        this.canReasonablyAskForMoney = // eg become a supporter, give a contribution
            !(userFeatures.isPayingMember() || config.page.shouldHideAdverts || config.page.isAdvertisementFeature);

        this.async = {
            canDisplayMembershipEngagementBanner : detect.adblockInUse.then(function (adblockUsed) {
                return !adblockUsed && self.canReasonablyAskForMoney;
            })
        };
    }

    try {
        config.commercial = config.commercial || {};
        return config.commercial.featuresDebug = new CommercialFeatures();
    } catch (error) {
        robust.log('cm-commercialFeatures', error);
    }

});
