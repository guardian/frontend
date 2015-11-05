define([
    'common/utils/location',
    'common/utils/config',
    'common/utils/detect',
    'common/modules/commercial/user-features',
    'common/modules/user-prefs',
    'lodash/objects/mapValues'
], function (
    location,
    config,
    detect,
    userFeatures,
    userPrefs,
    mapValues) {
    var policies = {};

    policies.defaultAds = function () {
        return new CommercialFeatureSwitches(true);
    };

    policies.sensitiveContent = function () {
        // Avoid inappropriate adverts on pages with content of a sensitive nature
        if (config.page.shouldHideAdverts || config.page.section === 'childrens-books-site') {
            return new CommercialFeatureSwitches(false);
        }
    };

    policies.sslContent = function () {
        if (config.page.isSSL && config.page.section !== 'admin') {
            return new CommercialFeatureSwitches(false);
        }
    };

    policies.noadsHash = function () {
        if (location.getHash().match(/[#&]noads(&.*)?$/)) {
            return new CommercialFeatureSwitches(false);
        }
    };

    policies.userPrefs = function () {
        if (userPrefs.isOff('adverts')) {
            return new CommercialFeatureSwitches(false);
        }
    };

    policies.adfreeExperience = function () {
        if (userFeatures.isAdfree()) {
            return {
                articleBodyAdverts : false,
                articleAsideAdverts : false,
                sliceAdverts : false,
                popularContentMPU : false,
                videoPreRolls : false
            };
        }
    };

    policies.membershipMessages = function () {
        if (!detect.adblockInUse() &&
            detect.getBreakpoint() !== 'mobile' &&
            config.page.contentType === 'Article'
        ) {
            return {
                membershipMessages : true
            };
        }
    };

    policies.identityPages = function () {
        if (config.page.contentType === 'Identity' ||
            config.page.section === 'identity' // needed for pages under the profile subdomain
        ) {
            return {thirdPartyTags : false};
        }
    };

    policies.nonArticlePages = function () {
        var isArticle = config.page.contentType === 'Article',
            isLiveBlog = config.page.isLiveBlog;

        if (!isArticle && !isLiveBlog) {
            return {
                articleBodyAdverts : false,
                articleAsideAdverts : false
            };
        } else if (isLiveBlog) {
            return {
                articleBodyAdverts : false
            };
        }
    };

    policies.nonFrontPages = function () {
        if (!config.page.isFront) {
            return {frontCommercialComponents : false};
        }
    };

    policies.tonePolicy = function () {
        if (config.hasTone('Match reports')) {
            return {articleAsideAdverts : false};
        }
    };

    policies.switchboard = function () {
        var switches = {};

        if (!config.switches.videoAdverts) {
            switches.videoPreRolls = false;
        }
        if (!config.switches.standardAdverts) {
            switches.articleBodyAdverts = false;
            switches.articleAsideAdverts = false;
            switches.sliceAdverts = false;
        }
        if (!config.switches.commercialComponents) {
            switches.frontCommercialComponents = false;
        }
        if (!config.switches.sponsored) {
            switches.badges = false;
        }
        if (!config.switches.membershipMessages) {
            switches.membershipMessages = false;
        }

        return switches;
    };

    function CommercialFeatureSwitches(enabled) {
        this.dfpAdvertising = enabled;
        this.topBannerAd = enabled;
        this.articleBodyAdverts = enabled;
        this.articleAsideAdverts = enabled;
        this.sliceAdverts = enabled;
        this.popularContentMPU = enabled;
        this.videoPreRolls = enabled;
        this.frontCommercialComponents = enabled;
        this.thirdPartyTags = enabled;
        this.badges = enabled;
    }

    function getPolicySwitches() {
        return mapValues(policies, function applyPolicy(policy) {
            return policy();
        });
    }

    return {
        getPolicySwitches: getPolicySwitches
    };
});
