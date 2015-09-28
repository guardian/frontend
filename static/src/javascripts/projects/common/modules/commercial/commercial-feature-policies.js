define([
    'common/utils/_',
    'common/utils/location',
    'common/utils/config',
    'common/modules/commercial/user-ad-preference',
    'common/modules/identity/api',
    'common/modules/user-prefs'
], function (
    _,
    location,
    config,
    userAdPreference,
    identityApi,
    userPrefs
) {
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
        // This is used for performance testing
        if (location.getHash().match(/[#&]noads(&.*)?$/)) {
            return new CommercialFeatureSwitches(false);
        }
    };

    policies.userPrefs = function () {
        if (userPrefs.isOff('adverts')) {
            return new CommercialFeatureSwitches(false);
        }
    };

    policies.signedInUsers = function () {
        if (identityApi.isUserLoggedIn()) {
            return {
                commentAdverts : false
            };
        }
    };

    policies.adfreeExperience = function () {
        if (userAdPreference.hideAds) {
            return {
                articleMPUs : false,
                sliceAdverts : false,
                commentAdverts : false,
                popularContentMPU : false,
                videoPreRolls : false
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
        if (config.page.contentType !== 'Article' && !config.page.isLiveBlog) {
            return {articleMPUs : false};
        }
    };

    policies.nonFrontPages = function () {
        if (!config.page.isFront) {
            return {frontCommercialComponents : false};
        }
    };

    policies.pagesWithoutComments = function () {
        if (!config.page.commentable) {
            return {commentAdverts : false};
        }
    };

    policies.switchboard = function () {
        var switches = {};

        if (!config.switches.videoAdverts) {
            switches.videoPreRolls = false;
        }
        if (!config.switches.standardAdverts) {
            switches.articleMPUs = false;
            switches.sliceAdverts = false;
            switches.commentAdverts = false;
        }
        if (!config.switches.commercialComponents) {
            switches.frontCommercialComponents = false;
        }
        if (!config.switches.sponsored) {
            switches.badges = false;
        }
        if (!config.switches.viewability) {
            switches.commentAdverts = false;
        }
        if (!config.switches.discussion) {
            switches.commentAdverts = false;
        }

        return switches;
    };

    function CommercialFeatureSwitches(enabled) {
        this.dfpAdvertising = enabled;
        this.articleMPUs = enabled;
        this.sliceAdverts = enabled;
        this.commentAdverts = enabled;
        this.popularContentMPU = enabled;
        this.videoPreRolls = enabled;
        this.frontCommercialComponents = enabled;
        this.thirdPartyTags = enabled;
        this.badges = enabled;
    }

    function getPolicySwitches() {
        return _.mapValues(policies, function applyPolicy(policy) {
            return policy();
        });
    }

    return {
        getPolicySwitches: getPolicySwitches
    };
});
