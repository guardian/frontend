import _        from 'common/utils/_';
import Injector from 'helpers/injector';

const injector = new Injector();

describe('Commercial features', ()=> {
    let commercialFeaturePolicies, config, userAdPreference, userPrefs;

    beforeEach((done)=> {
        injector.test([
            'common/modules/commercial/commercial-feature-policies',
            'common/utils/config',
            'common/modules/commercial/user-ad-preference',
            'common/modules/user-prefs'
        ], function () {
            commercialFeaturePolicies = arguments[0];
            config = arguments[1];
            userAdPreference = arguments[2];
            userPrefs = arguments[3];

            done();
        });
    });

    describe('Default ad policy', ()=> {
        it('everything is enabled by default', ()=> {
            const switches = commercialFeaturePolicies.getPolicySwitches().defaultAds;
            _.forOwn(switches, (featureSwitch)=> {
                expect(featureSwitch).toBe(true);
            });
        });
    });

    describe('Sensitive content policy', ()=> {
        it('hides all features on a sensitive page', ()=> {
            config.page.shouldHideAdverts = true;
            const switches = commercialFeaturePolicies.getPolicySwitches().sensitiveContent;
            _.forOwn(switches, (featureSwitch)=> {
                expect(featureSwitch).toBe(false);
            });
        });

        it('hides all features on pages in the childrens\' book site', ()=> {
            config.page.section = 'childrens-books-site';
            const switches = commercialFeaturePolicies.getPolicySwitches().sensitiveContent;
            _.forOwn(switches, (featureSwitch)=> {
                expect(featureSwitch).toBe(false);
            });
        });

        it('applies no changes to a non-sensitive page outside the childrens\' book site', ()=> {
            config.page.shouldHideAdverts = false;
            config.page.section = 'news';
            const switches = commercialFeaturePolicies.getPolicySwitches().sensitiveContent;
            expect(switches).toBeUndefined();
        });
    });

    describe('SSL content policy', ()=> {
        it('hides all features on a non-admin SSL page', ()=> {
            config.page.isSSL = true;
            config.page.section = 'news';
            const switches = commercialFeaturePolicies.getPolicySwitches().sslContent;
            _.forOwn(switches, (featureSwitch)=> {
                expect(featureSwitch).toBe(false);
            });
        });

        it('applies no changes to a non-SSL page', ()=> {
            config.page.isSSL = false;
            const switches = commercialFeaturePolicies.getPolicySwitches().sslContent;
            expect(switches).toBeUndefined();
        });

        it('applies no changes to an admin-section SSL page', ()=> {
            config.page.isSSL = true;
            config.page.section = 'admin';
            const switches = commercialFeaturePolicies.getPolicySwitches().sslContent;
            expect(switches).toBeUndefined();
        });
    });

    describe('UserPrefs policy', ()=> {
        it('hides all features when userPrefs has "adverts" opt out', ()=> {
            userPrefs.switchOff('adverts');
            const switches = commercialFeaturePolicies.getPolicySwitches().userPrefs;
            _.forOwn(switches, (featureSwitch)=> {
                expect(featureSwitch).toBe(false);
            });
        });

        it('applies no changes otherwise', ()=> {
            userPrefs.removeSwitch('adverts');
            const switches = commercialFeaturePolicies.getPolicySwitches().userPrefs;
            expect(switches).toBeUndefined();
        });
    });

    describe('Adfree experience policy', ()=> {
        it('enabling adfree hides some commercial content', ()=> {
            userAdPreference.hideAds = true;
            const switches = commercialFeaturePolicies.getPolicySwitches().adfreeExperience;

            expect(switches.articleMPUs).toBe(false);
            expect(switches.sliceAdverts).toBe(false);
            expect(switches.popularContentMPU).toBe(false);
            expect(switches.videoPreRolls).toBe(false);
        });

        it('enabling adfree does not hide other commercial content', ()=> {
            userAdPreference.hideAds = true;
            const switches = commercialFeaturePolicies.getPolicySwitches().adfreeExperience;

            expect(switches.dfpAdvertising).not.toBe(false);
            expect(switches.frontCommercialComponents).not.toBe(false);
            expect(switches.thirdPartyTags).not.toBe(false);
            expect(switches.badges).not.toBe(false);
        });

        it('applies no changes when adfree is disabled', ()=> {
            userAdPreference.hideAds = false;
            const switches = commercialFeaturePolicies.getPolicySwitches().adfreeExperience;
            expect(switches).toBeUndefined();
        });
    });

    describe('Identity page policy', ()=> {
        it('pages in the identity section do not run third party tags', ()=> {
            config.page.section = 'identity';
            const switches = commercialFeaturePolicies.getPolicySwitches().identityPages;
            expect(switches.thirdPartyTags).toBe(false);
        });

        it('pages with the "Identity" content type do not run third party tags', ()=> {
            config.page.contentType = 'Identity';
            const switches = commercialFeaturePolicies.getPolicySwitches().identityPages;
            expect(switches.thirdPartyTags).toBe(false);
        });

        it('applies no changes on non-"Identity" type content outside the identity section', ()=> {
            config.page.section = 'news';
            config.page.contentType = 'Article';
            const switches = commercialFeaturePolicies.getPolicySwitches().identityPages;
            expect(switches).toBeUndefined();
        });
    });

    describe('Non-article pages policy', ()=> {
        it('hides article MPUs on non-article pages', ()=> {
            config.page.contentType = 'Gallery';
            const switches = commercialFeaturePolicies.getPolicySwitches().nonArticlePages;
            expect(switches.articleMPUs).toBe(false);
        });

        it('applies no changes otherwise', ()=> {
            config.page.contentType = 'Article';
            const switches = commercialFeaturePolicies.getPolicySwitches().nonArticlePages;
            expect(switches).toBeUndefined();
        });
    });

    describe('Non-front pages policy', ()=> {
        it('hides front commercial components', ()=> {
            config.page.isFront = false;
            const switches = commercialFeaturePolicies.getPolicySwitches().nonFrontPages;
            expect(switches.frontCommercialComponents).toBe(false);
        });

        it('applies no changes otherwise', ()=> {
            config.page.isFront = true;
            const switches = commercialFeaturePolicies.getPolicySwitches().nonFrontPages;
            expect(switches).toBeUndefined();
        });
    });

    describe('Switchboard policy', ()=> {
        it('disables badges when sponsored switch is off', ()=> {
            config.switches.sponsored = false;
            const switches = commercialFeaturePolicies.getPolicySwitches().switchboard;
            expect(switches.badges).toBe(false);
        });

        it('disables front commercial components if commercial-components switch is off', ()=> {
            config.switches.commercialComponents = false;
            const switches = commercialFeaturePolicies.getPolicySwitches().switchboard;
            expect(switches.frontCommercialComponents).toBe(false);
        });

        it('disables article adverts if standard-adverts switch is off', ()=> {
            config.switches.standardAdverts = false;
            const switches = commercialFeaturePolicies.getPolicySwitches().switchboard;
            expect(switches.articleMPUs).toBe(false);
        });

        it('disables slice adverts if standard-adverts switch is off', ()=> {
            config.switches.standardAdverts = false;
            const switches = commercialFeaturePolicies.getPolicySwitches().switchboard;
            expect(switches.sliceAdverts).toBe(false);
        });

        it('disables video pre-rolls if video-adverts switch is off', ()=> {
            config.switches.videoAdverts = false;
            const switches = commercialFeaturePolicies.getPolicySwitches().switchboard;
            expect(switches.videoPreRolls).toBe(false);
        });
    });

});
