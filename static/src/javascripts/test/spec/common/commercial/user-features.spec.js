/* jscs:disable disallowDanglingUnderscores */
import Injector from 'helpers/injector';

const injector = new Injector();

describe('The user features service', function () {
    var config, cookies, userFeatures, identityApi, PERSISTENCE_KEYS;

    PERSISTENCE_KEYS = {
        ADFREE_COOKIE : 'gu_adfree_user',
        USER_FEATURES_EXPIRY_COOKIE : 'gu_user_features_expiry'
    };

    beforeEach(function (done) {
        injector.test([
            'common/utils/config',
            'common/utils/cookies',
            'common/modules/commercial/user-features',
            'common/modules/identity/api'
        ], function () {
            config = arguments[0];
            cookies = arguments[1];
            userFeatures = arguments[2];
            identityApi = arguments[3];

            spyOn(userFeatures, '_updateUserFeatures');
            spyOn(userFeatures, '_persistResponse');

            done();
        });
    });

    describe('The adfree getter', function () {
        beforeEach(function () {
            config.commercial = {showingAdfree : undefined};
        });

        it('defers to the value set in config.commercial', function () {
            config.commercial.showingAdfree = true;
            expect(userFeatures.isAdfree()).toBe(true);

            config.commercial.showingAdfree = false;
            expect(userFeatures.isAdfree()).toBe(false);
        });

        it('if no value set, reports adfree as disabled', function () {
            // This might happen if the feature switch is turned off, for instance
            config.commercial.showingAdfree = undefined;
            expect(userFeatures.isAdfree()).toBe(false);
        });

        it('if no config map at all, reports adfree as disabled', function () {
            // This scenario will happen when the code is run through other unit tests!
            config = {};
            expect(userFeatures.isAdfree()).toBe(false);
        });
    });

    describe('Refreshing the features data', function () {

        describe('If feature enabled', function () {
            beforeEach(function () {
                config.switches = {advertOptOut : true};
            });

            describe('If user signed in', function () {
                beforeEach(function () {
                    identityApi.isUserLoggedIn = function () {return true;};
                });

                it('If user has no feature data, performs update', function () {
                    cookies.remove(PERSISTENCE_KEYS.ADFREE_COOKIE);
                    cookies.remove(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE);
                    userFeatures.refresh();
                    expect(userFeatures._updateUserFeatures).toHaveBeenCalled();
                });

                it('If user has expired feature data, performs update', function () {
                    // Let's say our data expired 24 hours ago
                    var expiry = new Date();
                    expiry.setDate(expiry.getDate() - 1);

                    cookies.add(PERSISTENCE_KEYS.ADFREE_COOKIE, true);
                    cookies.add(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE, expiry.getTime());

                    userFeatures.refresh();
                    expect(userFeatures._updateUserFeatures).toHaveBeenCalled();
                });

                it('If user has fresh feature data, does not perform update', function () {
                    // This time our data will expire 24 hours hence
                    var expiry = new Date();
                    expiry.setDate(expiry.getDate() + 1);

                    cookies.add(PERSISTENCE_KEYS.ADFREE_COOKIE, true);
                    cookies.add(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE, expiry.getTime());

                    userFeatures.refresh();
                    expect(userFeatures._updateUserFeatures).not.toHaveBeenCalled();
                });
            });

            describe('If user signed out', function () {
                beforeEach(function () {
                    identityApi.isUserLoggedIn = function () {return false;};
                });

                it('Does not perform update, even if feature data missing', function () {
                    cookies.remove(PERSISTENCE_KEYS.ADFREE_COOKIE);
                    cookies.remove(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE);
                    userFeatures.refresh();
                    expect(userFeatures._updateUserFeatures).not.toHaveBeenCalled();
                });

                it('Cleans up outstanding feature data', function () {
                    // Create valid feature data
                    var expiry = new Date();
                    expiry.setDate(expiry.getDate() + 1);
                    cookies.add(PERSISTENCE_KEYS.ADFREE_COOKIE, true);
                    cookies.add(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE, expiry.getTime());

                    userFeatures.refresh();
                    expect(cookies.get(PERSISTENCE_KEYS.ADFREE_COOKIE)).toBeNull();
                    expect(cookies.get(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE)).toBeNull();
                });
            });
        });

        describe('If feature disabled', function () {
            beforeEach(function () {
                config.switches = {advertOptOut : false};
            });

            it('Does not perform update, even if a signed in user has no feature data', function () {
                identityApi.isUserLoggedIn = function () {return true;};
                cookies.remove(PERSISTENCE_KEYS.ADFREE_COOKIE);
                cookies.remove(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE);

                userFeatures.refresh();
                expect(userFeatures._updateUserFeatures).not.toHaveBeenCalled();
            });

            it('Cleans up any outstanding feature data, even for signed in users', function () {
                identityApi.isUserLoggedIn = function () {return true;};
                var expiry = new Date();
                expiry.setDate(expiry.getDate() + 1);
                cookies.add(PERSISTENCE_KEYS.ADFREE_COOKIE, true);
                cookies.add(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE, expiry.getTime());

                userFeatures.refresh();
                expect(cookies.get(PERSISTENCE_KEYS.ADFREE_COOKIE)).toBeNull();
                expect(cookies.get(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE)).toBeNull();
            });
        });
    });

    describe('Storing new feature data', function () {
        beforeEach(function () {
            cookies.remove(PERSISTENCE_KEYS.ADFREE_COOKIE);
            cookies.remove(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE);

            // Unspy method to test it
            userFeatures._persistResponse.and.callThrough();
        });

        it('Puts the adfree state in a cookie, so that the server can scrub it on logout', function () {
            userFeatures._persistResponse({adFree : true});
            expect(cookies.get(PERSISTENCE_KEYS.ADFREE_COOKIE)).toBe('true');

            userFeatures._persistResponse({adFree : false});
            expect(cookies.get(PERSISTENCE_KEYS.ADFREE_COOKIE)).toBe('false');
        });

        it('Puts an expiry date in an accompanying cookie', function () {
            userFeatures._persistResponse({adFree : true});
            var expiryDate = cookies.get(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE);
            expect(expiryDate).not.toBeNull();
        });

        it('The expiry date is string that parsed into a Unix epoch', function () {
            userFeatures._persistResponse({adFree : true});
            var expiryDateString = cookies.get(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE);
            expect(isNaN(expiryDateString)).toBe(false);
        });

        it('The expiry date is in the future', function () {
            userFeatures._persistResponse({adFree : true});
            var expiryDate = cookies.get(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE);
            var currentTime = new Date().getTime();
            expect(currentTime < expiryDate).toBe(true);
        });
    });
});
/* jscs:enable disallowDanglingUnderscores */

