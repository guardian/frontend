define([
    'helpers/injector',
    'lodash/objects/forOwn'
], function (
    Injector,
    forOwn) {
    var injector = new Injector();

    describe('Commercial features', function () {
        var commercialFeaturePolicies, config, detect, location, userFeatures, userPrefs;

        beforeEach(function (done) {
            injector.require([
                'common/modules/commercial/commercial-feature-policies',
                'common/utils/config',
                'common/utils/detect',
                'common/utils/location',
                'common/modules/commercial/user-features',
                'common/modules/user-prefs'
            ], function () {
                commercialFeaturePolicies = arguments[0];
                config = arguments[1];
                detect = arguments[2];
                location = arguments[3];
                userFeatures = arguments[4];
                userPrefs = arguments[5];
                done();
            });
        });

        describe('Default ad policy', function () {
            it('everything is enabled by default', function () {
                var switches = commercialFeaturePolicies.getPolicySwitches().defaultAds;
                forOwn(switches, function (featureSwitch) {
                    expect(featureSwitch).toBe(true);
                });
            });
        });

        describe('Sensitive content policy', function () {
            var featuresToDisable = {
                dfpAdvertising : false,
                topBannerAd : false,
                articleBodyAdverts : false,
                articleAsideAdverts : false,
                sliceAdverts : false,
                popularContentMPU : false,
                videoPreRolls : false,
                frontCommercialComponents : false,
                outbrain : false
            };

            it('hides features on a sensitive page', function () {
                config.page.shouldHideAdverts = true;
                var switches = commercialFeaturePolicies.getPolicySwitches().sensitiveContent;
                expect(switches).toEqual(featuresToDisable);
            });

            it('hides all features on pages in the childrens\' book site', function () {
                config.page.section = 'childrens-books-site';
                var switches = commercialFeaturePolicies.getPolicySwitches().sensitiveContent;
                expect(switches).toEqual(featuresToDisable);
            });

            it('applies no changes to a non-sensitive page outside the childrens\' book site', function () {
                config.page.shouldHideAdverts = false;
                config.page.section = 'news';
                var switches = commercialFeaturePolicies.getPolicySwitches().sensitiveContent;
                expect(switches).toBeUndefined();
            });
        });

        describe('SSL content policy', function () {
            it('hides all features on a non-admin SSL page', function () {
                config.page.isSSL = true;
                config.page.section = 'news';
                var switches = commercialFeaturePolicies.getPolicySwitches().sslContent;
                forOwn(switches, function (featureSwitch) {
                    expect(featureSwitch).toBe(false);
                });
            });

            it('applies no changes to a non-SSL page', function () {
                config.page.isSSL = false;
                var switches = commercialFeaturePolicies.getPolicySwitches().sslContent;
                expect(switches).toBeUndefined();
            });

            it('applies no changes to an admin-section SSL page', function () {
                config.page.isSSL = true;
                config.page.section = 'admin';
                var switches = commercialFeaturePolicies.getPolicySwitches().sslContent;
                expect(switches).toBeUndefined();
            });
        });

        describe('#noads hash policy', function () {
            it('hides all features when the page has the #noads hash', function () {
                location.getHash = function () {
                    return '#noads';
                };
                var switches = commercialFeaturePolicies.getPolicySwitches().noadsHash;
                forOwn(switches, function (featureSwitch) {
                    expect(featureSwitch).toBe(false);
                });
            });

            it('applies no changes otherwise', function () {
                location.getHash = function () {
                    return '';
                };
                var switches = commercialFeaturePolicies.getPolicySwitches().noadsHash;
                expect(switches).toBeUndefined();
            });
        });

        describe('Membership messages policy', function () {
            it('displays message when all required conditions are true', function () {
                detect.adblockInUse = function () { return false; };
                detect.getBreakpoint = function () { return 'desktop'; };
                config.page.contentType = 'Article';
                var switches = commercialFeaturePolicies.getPolicySwitches().membershipMessages;
                forOwn(switches, function (featureSwitch) {
                    expect(featureSwitch).toBe(true);
                });
            });

            it('Does not display messages when adBlock is enabled', function () {
                detect.adblockInUse = function () { return true; };
                detect.getBreakpoint = function () { return 'desktop'; };
                config.page.contentType = 'Article';
                var switches = commercialFeaturePolicies.getPolicySwitches().membershipMessages;
                forOwn(switches, function (featureSwitch) {
                    expect(featureSwitch).toBe(false);
                });
            });

            it('Does not display messages on mobile', function () {
                detect.adblockInUse = function () { return false; };
                detect.getBreakpoint = function () { return 'mobile'; };
                config.page.contentType = 'Article';
                var switches = commercialFeaturePolicies.getPolicySwitches().membershipMessages;
                forOwn(switches, function (featureSwitch) {
                    expect(featureSwitch).toBe(false);
                });
            });

            it('Does not display messages on non-article content', function () {
                detect.adblockInUse = function () { return false; };
                detect.getBreakpoint = function () { return 'mobile'; };
                config.page.contentType = 'LiveBlog';
                var switches = commercialFeaturePolicies.getPolicySwitches().membershipMessages;
                forOwn(switches, function (featureSwitch) {
                    expect(featureSwitch).toBe(false);
                });
            });
        });

        describe('UserPrefs policy', function () {
            it('hides all features when userPrefs has "adverts" opt out', function () {
                userPrefs.switchOff('adverts');
                var switches = commercialFeaturePolicies.getPolicySwitches().userPrefs;
                forOwn(switches, function (featureSwitch) {
                    expect(featureSwitch).toBe(false);
                });
            });

            it('applies no changes otherwise', function () {
                userPrefs.removeSwitch('adverts');
                var switches = commercialFeaturePolicies.getPolicySwitches().userPrefs;
                expect(switches).toBeUndefined();
            });
        });

        describe('Adfree experience policy', function () {
            it('enabling adfree hides some commercial content', function () {
                userFeatures.isAdfree = function () {return true;};
                var switches = commercialFeaturePolicies.getPolicySwitches().adfreeExperience;

                expect(switches.articleBodyAdverts).toBe(false);
                expect(switches.sliceAdverts).toBe(false);
                expect(switches.popularContentMPU).toBe(false);
                expect(switches.videoPreRolls).toBe(false);
            });

            it('enabling adfree does not hide other commercial content', function () {
                userFeatures.isAdfree = function () {return true;};
                var switches = commercialFeaturePolicies.getPolicySwitches().adfreeExperience;

                expect(switches.dfpAdvertising).not.toBe(false);
                expect(switches.frontCommercialComponents).not.toBe(false);
                expect(switches.thirdPartyTags).not.toBe(false);
                expect(switches.badges).not.toBe(false);
            });

            it('applies no changes when adfree is disabled', function () {
                userFeatures.isAdfree = function () {return false;};
                var switches = commercialFeaturePolicies.getPolicySwitches().adfreeExperience;
                expect(switches).toBeUndefined();
            });
        });

        describe('Identity page policy', function () {
            it('pages in the identity section do not run third party tags', function () {
                config.page.section = 'identity';
                var switches = commercialFeaturePolicies.getPolicySwitches().identityPages;
                expect(switches.thirdPartyTags).toBe(false);
            });

            it('pages with the "Identity" content type do not run third party tags', function () {
                config.page.contentType = 'Identity';
                var switches = commercialFeaturePolicies.getPolicySwitches().identityPages;
                expect(switches.thirdPartyTags).toBe(false);
            });

            it('applies no changes on non-"Identity" type content outside the identity section', function () {
                config.page.section = 'news';
                config.page.contentType = 'Article';
                var switches = commercialFeaturePolicies.getPolicySwitches().identityPages;
                expect(switches).toBeUndefined();
            });
        });

        describe('Non-article pages policy', function () {
            beforeEach(function () {
                config.page.contentType = 'Article';
                config.page.isLiveBlog = false;
            });

            it('hides body MPUs on non-article pages', function () {
                config.page.contentType = 'Gallery';
                var switches = commercialFeaturePolicies.getPolicySwitches().nonArticlePages;
                expect(switches.articleBodyAdverts).toBe(false);
            });

            it('hides body MPUs on live blog articles', function () {
                config.page.contentType = 'Article';
                config.page.isLiveBlog = true;
                var switches = commercialFeaturePolicies.getPolicySwitches().nonArticlePages;
                expect(switches.articleBodyAdverts).toBe(false);
            });

            it('hides aside MPUs on non-article pages', function () {
                config.page.contentType = 'Gallery';
                var switches = commercialFeaturePolicies.getPolicySwitches().nonArticlePages;
                expect(switches.articleAsideAdverts).toBe(false);
            });

            it('does not hide aside MPUs on live blog articles', function () {
                config.page.contentType = 'Article';
                config.page.isLiveBlog = true;
                var switches = commercialFeaturePolicies.getPolicySwitches().nonArticlePages;
                expect(switches.articleAsideAdverts).toBeUndefined();
            });

            it('applies no changes otherwise', function () {
                var switches = commercialFeaturePolicies.getPolicySwitches().nonArticlePages;
                expect(switches).toBeUndefined();
            });
        });

        describe('Non-front pages policy', function () {
            it('hides front commercial components', function () {
                config.page.isFront = false;
                var switches = commercialFeaturePolicies.getPolicySwitches().nonFrontPages;
                expect(switches.frontCommercialComponents).toBe(false);
            });

            it('applies no changes otherwise', function () {
                config.page.isFront = true;
                var switches = commercialFeaturePolicies.getPolicySwitches().nonFrontPages;
                expect(switches).toBeUndefined();
            });
        });

        describe('Page tone policy', function () {
            it('does not load commercial components on Match reports tone', function () {
                config.hasTone = function () { return true; };

                var switches = commercialFeaturePolicies.getPolicySwitches().tonePolicy;
                expect(switches.articleAsideAdverts).toBe(false);
            });

            it('applies no changes otherwise', function () {
                config.hasTone = function () { return false; };
                var switches = commercialFeaturePolicies.getPolicySwitches().tonePolicy;
                expect(switches).toBeUndefined();
            });
        });

        describe('Switchboard policy', function () {
            it('disables badges when sponsored switch is off', function () {
                config.switches.sponsored = false;
                var switches = commercialFeaturePolicies.getPolicySwitches().switchboard;
                expect(switches.badges).toBe(false);
            });

            it('disables front commercial components if commercial-components switch is off', function () {
                config.switches.commercialComponents = false;
                var switches = commercialFeaturePolicies.getPolicySwitches().switchboard;
                expect(switches.frontCommercialComponents).toBe(false);
            });

            it('disables article adverts if standard-adverts switch is off', function () {
                config.switches.standardAdverts = false;
                var switches = commercialFeaturePolicies.getPolicySwitches().switchboard;
                expect(switches.articleBodyAdverts).toBe(false);
            });

            it('disables slice adverts if standard-adverts switch is off', function () {
                config.switches.standardAdverts = false;
                var switches = commercialFeaturePolicies.getPolicySwitches().switchboard;
                expect(switches.sliceAdverts).toBe(false);
            });

            it('disables video pre-rolls if video-adverts switch is off', function () {
                config.switches.videoAdverts = false;
                var switches = commercialFeaturePolicies.getPolicySwitches().switchboard;
                expect(switches.videoPreRolls).toBe(false);
            });
        });

    });

});
