define([
    'common/utils/_',
    'common/utils/config',
    'common/modules/commercial/user-ad-preference',
    'common/modules/user-prefs'
], function (
    _,
    config,
    userAdPreference,
    userPrefs
) {
    var commercialFeatures, featureFilters;

    commercialFeatures =  {
        dfpAdvertising : true,
        articleMPUs : true,
        sliceAdverts : true,
        popularContentMPU : true,
        videoPreRolls : true,
        frontCommercialComponents : true,
        thirdPartyTags : true,
        badges : true
    };

    featureFilters = {
        // Each filter encapsulates a feature policy - a condition where it is implemented,
        // and the commercial features it disables.

        sensitiveContent : function(){
            // Avoid inappropriate adverts on pages with content of a sensitive nature
            if (config.page.shouldHideAdverts || config.page.section === 'childrens-books-site') {
                disableAllFeatures();
            }
        },
        adfreeExperience : function() {
            // Some paying users may opt out of _some_ advertising
            if (userAdPreference.hideAds) {
                commercialFeatures.articleMPUs = false;
                commercialFeatures.sliceAdverts = false;
                commercialFeatures.popularContentMPU = false;
                commercialFeatures.videoPreRolls = false;
            }
        },
        sslExclusions : function() {
            if (config.page.isSSL && config.page.section !== 'admin') {
                disableAllFeatures();
            }
        },
        uriOptOuts : function() {
            // Allow performance tests to exclude advertising
            if (window.location.hash.match(/[#&]noads(&.*)?$/)) {
                disableAllFeatures();
            }
        },
        userPrefs : function() {
            if (userPrefs.isOff('adverts')) {
                disableAllFeatures();
            }
        },
        switchboardSettings : function() {
            if (!config.switches.videoAdverts) {
                commercialFeatures.videoPreRolls = false;
            }
            if (!config.switches.standardAdverts) {
                commercialFeatures.articleMPUs = false;
                commercialFeatures.sliceAdverts = false;
            }
            if (!config.switches.commercialComponents) {
                commercialFeatures.frontCommercialComponents = false;
            }
            if (!config.switches.sponsored) {
                commercialFeatures.badges = false;
            }
        },
        contentSpecific : function() {
            if (config.page.contentType !== 'Article' && !config.page.isLiveBlog) {
                commercialFeatures.articleMPUs = false;
            }
            if (!config.page.isFront) {
                commercialFeatures.frontCommercialComponents = false;
            }
            if (config.page.contentType === 'Identity' || config.page.section === 'identity') {
                commercialFeatures.thirdPartyTags = false;
            }
        },
        previewPage : function() {
            if (config.page.isPreview) {
                commercialFeatures.videoPreRolls = false;
            }
        }
    };

    function applyFeatureFilters() {
        _.forOwn(featureFilters, function applyFilter(filterFunction){
            filterFunction();
        });
    }

    function disableAllFeatures() {
        _.forOwn(commercialFeatures, function(featureState, featureKey) {
            commercialFeatures[featureKey] = false;
        });
    }

    applyFeatureFilters();
    return commercialFeatures;
});

