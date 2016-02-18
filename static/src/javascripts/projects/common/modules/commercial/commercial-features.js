define([
    'common/utils/location',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/robust',
    'common/modules/commercial/user-features',
    'common/modules/user-prefs'
], function (
    location,
    config,
    detect,
    robust,
    userFeatures,
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

        var minuteArticle = config.page.isMinuteArticle;

        var isArticle = config.page.contentType === 'Article';

        var isLiveBlog = config.page.isLiveBlog;

        var isMatchReport = config.hasTone('Match reports');

        var isIdentityPage =
            config.page.contentType === 'Identity' ||
            config.page.section === 'identity'; // needed for pages under profile.* subdomain

        var switches = config.switches;

        // Feature switches

        this.dfpAdvertising =
            externalAdvertising &&
            !sensitiveContent;

        this.topBannerAd =
            this.dfpAdvertising &&
            !minuteArticle;

        this.articleBodyAdverts =
            this.dfpAdvertising &&
            !minuteArticle &&
            isArticle &&
            !isLiveBlog &&
            switches.standardAdverts;

        this.articleAsideAdverts =
            this.dfpAdvertising &&
            !minuteArticle &&
            !isMatchReport &&
            !!(isArticle || isLiveBlog) &&
            switches.standardAdverts;

        this.sliceAdverts =
            this.dfpAdvertising &&
            !minuteArticle &&
            switches.standardAdverts;

        this.popularContentMPU =
            this.dfpAdvertising &&
            !minuteArticle;

        this.videoPreRolls =
            externalAdvertising &&
            !sensitiveContent &&
            switches.videoAdverts;

        this.frontCommercialComponents =
            this.dfpAdvertising &&
            !minuteArticle &&
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
            switches.outbrain;

        this.async = {
            membershipMessages : detect.adblockInUse.then(function (adblockUsed) {
                return !adblockUsed &&
                    detect.getBreakpoint() !== 'mobile' &&
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

