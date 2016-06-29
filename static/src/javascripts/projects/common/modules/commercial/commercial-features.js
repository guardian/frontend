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
        var isSSL =
            config.page.isSSL &&
            config.page.section !== 'admin';

        // this is used for SpeedCurve tests
        var noadsUrl = location.getHash().match(/[#&]noads(&.*)?$/);

        var externalAdvertising =
            !isSSL &&
            !noadsUrl &&
            !userPrefs.isOff('adverts');

        var sensitiveContent =
            config.page.shouldHideAdverts ||
            config.page.section === 'childrens-books-site';

        var isMinuteArticle = config.page.isMinuteArticle;

        var isArticle = config.page.contentType === 'Article';

        var isLiveBlog = config.page.isLiveBlog;

        var isMatchReport = config.hasTone('Match reports');

        var isIdentityPage =
            config.page.contentType === 'Identity' ||
            config.page.section === 'identity'; // needed for pages under profile.* subdomain

        var switches = config.switches;

        var isWidePage = detect.getBreakpoint() === 'wide';

        // Feature switches

        this.dfpAdvertising =
            externalAdvertising &&
            !sensitiveContent;

        this.topBannerAd =
            this.dfpAdvertising &&
            !userFeatures.isAdfree() &&
            !isMinuteArticle;

        this.articleBodyAdverts =
            this.dfpAdvertising &&
            !isMinuteArticle &&
            isArticle &&
            !isLiveBlog &&
            !userFeatures.isAdfree() &&
            switches.standardAdverts;

        this.articleAsideAdverts =
            this.dfpAdvertising &&
            !isMinuteArticle &&
            !isMatchReport &&
            !!(isArticle || isLiveBlog) &&
            !userFeatures.isAdfree() &&
            switches.standardAdverts;

        this.sliceAdverts =
            this.dfpAdvertising &&
            !isMinuteArticle &&
            !userFeatures.isAdfree() &&
            switches.standardAdverts;

        this.popularContentMPU =
            this.dfpAdvertising &&
            !userFeatures.isAdfree() &&
            !isMinuteArticle;

        this.videoPreRolls =
            externalAdvertising &&
            !sensitiveContent &&
            !userFeatures.isAdfree() &&
            switches.videoAdverts;

        this.frontCommercialComponents =
            this.dfpAdvertising &&
            !isMinuteArticle &&
            config.page.isFront &&
            switches.commercialComponents;

        this.thirdPartyTags =
            externalAdvertising &&
            !isIdentityPage;

        this.badges =
            externalAdvertising &&
            switches.sponsored;

        this.outbrain =
            externalAdvertising &&
            !sensitiveContent &&
            switches.outbrain &&
            config.page.showRelatedContent;

        this.commentAdverts =
            this.dfpAdvertising &&
            switches.standardAdverts &&
            !isMinuteArticle &&
            config.switches.discussion &&
            config.page.commentable &&
            identityApi.isUserLoggedIn() &&
            !userFeatures.isAdfree() &&
            (!isLiveBlog || isWidePage);

        this.liveblogAdverts =
            this.dfpAdvertising &&
            switches.liveblogAdverts;

        this.async = {
            membershipMessages : detect.adblockInUse.then(function (adblockUsed) {
                return !adblockUsed &&
                    isArticle &&
                    !userFeatures.isPayingMember();
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
