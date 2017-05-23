define([
    'lib/config',
    'lib/detect',
    'lib/robust',
    'commercial/modules/user-features',
    'common/modules/identity/api',
    'common/modules/user-prefs'
], function (
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
        var noadsUrl = window.location.hash.match(/[#&]noads(&.*)?$/);

        var externalAdvertising =
            !noadsUrl &&
            !userPrefs.isOff('adverts');

        var sensitiveContent =
            config.page.shouldHideAdverts ||
            config.page.section === 'childrens-books-site';

        var isMinuteArticle = config.page.isMinuteArticle;

        var isArticle = config.page.contentType === 'Article';

        var isInteractive = config.page.contentType === 'Interactive';

        var isLiveBlog = config.page.isLiveBlog;

        var isHosted = config.page.isHosted;

        var isMatchReport = config.hasTone('Match reports');

        var isIdentityPage =
            config.page.contentType === 'Identity' ||
            config.page.section === 'identity'; // needed for pages under profile.* subdomain

        var switches = config.switches;

        var isWidePage = detect.getBreakpoint() === 'wide';

        var supportsSticky = document.documentElement.classList.contains('has-sticky');

        var newRecipeDesign = config.page.showNewRecipeDesign && config.tests.abNewRecipeDesign;

        // Feature switches

        this.dfpAdvertising =
            switches.commercial &&
            externalAdvertising &&
            !sensitiveContent;

        this.stickyTopBannerAd =
            !config.page.disableStickyTopBanner &&
            !supportsSticky;

        this.articleBodyAdverts =
            this.dfpAdvertising &&
            !isMinuteArticle &&
            isArticle &&
            !isLiveBlog &&
            !isHosted &&
            !newRecipeDesign;

        this.articleAsideAdverts =
            this.dfpAdvertising &&
            !isMinuteArticle &&
            !isMatchReport &&
            !!(isArticle || isLiveBlog) &&
            !newRecipeDesign;

        this.videoPreRolls =
            this.dfpAdvertising;

        this.highMerch =
            this.dfpAdvertising &&
            !isMinuteArticle &&
            !isHosted &&
            !isInteractive &&
            !config.page.isFront &&
            !newRecipeDesign;

        this.thirdPartyTags =
            externalAdvertising &&
            !isIdentityPage;

        this.outbrain =
            this.dfpAdvertising &&
            switches.outbrain &&
            isArticle &&
            !config.page.isPreview &&
            config.page.showRelatedContent &&
            !(identityApi.isUserLoggedIn() && config.page.commentable);

        this.commentAdverts =
            this.dfpAdvertising &&
            !isMinuteArticle &&
            config.switches.discussion &&
            config.page.commentable &&
            identityApi.isUserLoggedIn() &&
            (!isLiveBlog || isWidePage);

        this.liveblogAdverts =
            isLiveBlog &&
            this.dfpAdvertising;

        this.paidforBand =
            config.page.isPaidContent &&
            !config.page.hasSuperStickyBanner &&
            !supportsSticky;

        this.canReasonablyAskForMoney = // eg become a supporter, give a contribution
            !(userFeatures.isPayingMember() || config.page.shouldHideAdverts || config.page.isPaidContent);

        this.async = {
            canDisplayMembershipEngagementBanner : detect.adblockInUse.then(function (adblockUsed) {
                return !adblockUsed && self.canReasonablyAskForMoney;
            })
        };

        this.adFeedback =
            config.switches.adFeedback &&
            ['artanddesign', 'society', 'tvandradio'].indexOf(config.page.section) > -1;
    }

    try {
        config.commercial = config.commercial || {};
        return config.commercial.featuresDebug = new CommercialFeatures();
    } catch (error) {
        robust.logError('cm-commercialFeatures', error);
    }

});
