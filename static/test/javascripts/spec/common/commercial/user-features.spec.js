/* jscs:disable disallowDanglingUnderscores */
define(['helpers/injector'], function (Injector) {
    var injector = new Injector();

    describe('The user features service:', function () {
        var config, cookies, userFeatures, identityApi,
            PERSISTENCE_KEYS;

        PERSISTENCE_KEYS = {
            ADFREE_COOKIE : 'gu_adfree_user',
            USER_FEATURES_EXPIRY_COOKIE : 'gu_user_features_expiry',
            PAYING_MEMBER_COOKIE : 'gu_paying_member'
        };

        beforeEach(function (done) {
            injector.require([
                'common/utils/config',
                'common/utils/cookies',
                'common/modules/commercial/user-features',
                'common/modules/identity/api'
            ], function () {
                config = arguments[0];
                cookies = arguments[1];
                userFeatures = arguments[2];
                identityApi = arguments[3];

                spyOn(userFeatures, '_requestNewData');
                spyOn(userFeatures, '_deleteOldData');
                spyOn(userFeatures, '_persistResponse');

                done();
            });
        });

        describe('Refreshing the features data', function () {

            describe('If user signed in', function () {
                beforeEach(function () {
                    identityApi.isUserLoggedIn = function () {return true;};
                });

                it('Performs an update if the user has no data', function () {
                    deleteAllFeaturesData();
                    userFeatures.refresh();
                    expect(userFeatures._requestNewData).toHaveBeenCalled();
                });

                it('Performs an update if the user has expired data', function () {
                    setAllFeaturesData({isExpired: true});
                    userFeatures.refresh();
                    expect(userFeatures._requestNewData).toHaveBeenCalled();
                });

                it('Does not delete the data just because it has expired', function () {
                    setAllFeaturesData({isExpired: true});
                    userFeatures.refresh();
                    expect(userFeatures._deleteOldData).not.toHaveBeenCalled();
                });

                it('Does not perform update if user has fresh feature data', function () {
                    setAllFeaturesData({isExpired: false});
                    userFeatures.refresh();
                    expect(userFeatures._requestNewData).not.toHaveBeenCalled();
                });

                it('Performs an update if membership-frontend wipes just the paying-member cookie', function () {
                    // Set everything except paying-member cookie
                    setAllFeaturesData({isExpired: true});
                    cookies.remove(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE);

                    userFeatures.refresh();
                    expect(userFeatures._requestNewData).toHaveBeenCalled();
                });
            });

            describe('If user signed out', function () {
                beforeEach(function () {
                    identityApi.isUserLoggedIn = function () {return false;};
                });

                it('Does not perform update, even if feature data missing', function () {
                    deleteAllFeaturesData();
                    userFeatures.refresh();
                    expect(userFeatures._requestNewData).not.toHaveBeenCalled();
                });

                it('Deletes leftover feature data', function () {
                    setAllFeaturesData({isExpired: false});
                    userFeatures.refresh();
                    expect(userFeatures._deleteOldData).toHaveBeenCalled();
                });
            });
        });

        describe('The adfree getter', function () {
            beforeEach(function () {
                config.commercial = {};
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
                delete config.commercial;
                expect(userFeatures.isAdfree()).toBe(false);
            });
        });

        describe('The isPayingMember getter', function () {
            it('Is false when the user is logged out', function () {
                identityApi.isUserLoggedIn = function () {return false;};
                expect(userFeatures.isPayingMember()).toBe(false);
            });

            describe('When the user is logged in', function () {
                beforeEach(function () {
                    identityApi.isUserLoggedIn = function () {return true;};
                });

                it('Is true when the user has a `true` paying member cookie', function () {
                    cookies.add(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE, true);
                    expect(userFeatures.isPayingMember()).toBe(true);
                });

                it('Is false when the user has a `false` paying member cookie', function () {
                    cookies.add(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE, false);
                    expect(userFeatures.isPayingMember()).toBe(false);
                });

                it('Is true when the user has no paying member cookie', function () {
                    // If we don't know, we err on the side of caution, rather than annoy paying users
                    cookies.remove(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE);
                    expect(userFeatures.isPayingMember()).toBe(true);
                });
            });
        });

        describe('Deleting old feature data', function () {
            beforeEach(function () {
                // Unspy method to test it
                userFeatures._deleteOldData.and.callThrough();
            });

            it('Removes all cookies', function () {
                setAllFeaturesData({isExpired: false});
                userFeatures._deleteOldData();

                expect(cookies.get(PERSISTENCE_KEYS.ADFREE_COOKIE)).toBeNull();
                expect(cookies.get(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE)).toBeNull();
                expect(cookies.get(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE)).toBeNull();
            });
        });

        describe('Storing new feature data', function () {
            var serverResponse;

            beforeEach(function () {
                deleteAllFeaturesData();

                serverResponse = {
                    adFree : true,
                    adblockMessage : false
                };

                // Unspy method to test it
                userFeatures._persistResponse.and.callThrough();
            });

            it('Puts the adfree state in a cookie, so that the server can scrub it on logout', function () {
                serverResponse.adFree = true;
                userFeatures._persistResponse(serverResponse);
                expect(cookies.get(PERSISTENCE_KEYS.ADFREE_COOKIE)).toBe('true');

                serverResponse.adFree = false;
                userFeatures._persistResponse(serverResponse);
                expect(cookies.get(PERSISTENCE_KEYS.ADFREE_COOKIE)).toBe('false');
            });

            it('Puts the paying-member state in a cookie, so that membership-frontend can wipe it', function () {
                serverResponse.adblockMessage = true;
                userFeatures._persistResponse(serverResponse);
                expect(cookies.get(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE)).toBe('false');

                serverResponse.adblockMessage = false;
                userFeatures._persistResponse(serverResponse);
                expect(cookies.get(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE)).toBe('true');
            });

            it('Puts an expiry date in an accompanying cookie', function () {
                userFeatures._persistResponse(serverResponse);
                var expiryDate = cookies.get(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE);
                expect(expiryDate).not.toBeNull();
            });

            it('The expiry date can be parsed into a Unix epoch', function () {
                userFeatures._persistResponse(serverResponse);
                var expiryDateString = cookies.get(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE);
                expect(isNaN(expiryDateString)).toBe(false);
            });

            it('The expiry date is in the future', function () {
                var expiryDateString, expiryDateEpoch, currentTimeEpoch;

                userFeatures._persistResponse(serverResponse);

                expiryDateString = cookies.get(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE);
                expiryDateEpoch = parseInt(expiryDateString, 10);
                currentTimeEpoch = new Date().getTime();

                expect(currentTimeEpoch < expiryDateEpoch).toBe(true);
            });
        });

        function setAllFeaturesData(opts) {
            var expiryDate, currentTime, msInOneDay;

            currentTime = new Date().getTime();
            msInOneDay = 24 * 60 * 60 * 1000;
            expiryDate = opts.isExpired ? new Date(currentTime - msInOneDay) : new Date(currentTime + msInOneDay);

            cookies.add(PERSISTENCE_KEYS.ADFREE_COOKIE, true);
            cookies.add(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE, true);
            cookies.add(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE, expiryDate.getTime());
        }

        function deleteAllFeaturesData() {
            cookies.remove(PERSISTENCE_KEYS.ADFREE_COOKIE);
            cookies.remove(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE);
            cookies.remove(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE);
        }
    });
    /* jscs:enable disallowDanglingUnderscores */
});
