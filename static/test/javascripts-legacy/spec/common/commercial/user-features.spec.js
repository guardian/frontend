define(['helpers/injector'], function (Injector) {
    var injector = new Injector();

    fdescribe('The user features service:', function () {
        var cookies, userFeatures, identityApi, PERSISTENCE_KEYS;

        PERSISTENCE_KEYS = {
            USER_FEATURES_EXPIRY_COOKIE : 'gu_user_features_expiry',
            PAYING_MEMBER_COOKIE : 'gu_paying_member',
            AD_FREE_USER_COOKIE : 'GU_AFU'
        };

        beforeEach(function (done) {
            injector.require([
                'lib/cookies',
                'commercial/modules/user-features',
                'common/modules/identity/api'
            ], function () {
                cookies = arguments[0];
                userFeatures = arguments[1];
                identityApi = arguments[2];
                 spyOn(userFeatures._, 'requestNewData');
                 spyOn(userFeatures._, 'deleteOldData');
                 spyOn(userFeatures._, 'persistResponse');
                done();
            });
        });

        describe('Refreshing the features data', function () {

            describe('If user signed in', function () {
                beforeEach(function () {
                    identityApi.isUserLoggedIn = function () {return true;};
                });


                it('Performs an update if the user has missing data', function () {
                    deleteAllFeaturesData();
                    userFeatures._.refresh();
                    expect(userFeatures._.requestNewData).toHaveBeenCalled();
                });

                it('Performs an update if the user has expired data', function () {
                    setAllFeaturesData({isExpired: true});
                    userFeatures._.refresh();

                    expect(userFeatures._.requestNewData).toHaveBeenCalled();
                });

                it('Does not delete the data just because it has expired', function () {
                    setAllFeaturesData({isExpired: true});
                    userFeatures._.refresh();
                    expect(userFeatures._.deleteOldData).not.toHaveBeenCalled();
                });

                it('Does not perform update if user has fresh feature data', function () {
                    setAllFeaturesData({isExpired: false});
                    userFeatures._.refresh();
                    expect(userFeatures._.requestNewData).not.toHaveBeenCalled();
                });

                it('Performs an update if membership-frontend wipes just the paying-member cookie', function () {
                    // Set everything except paying-member cookie
                    setAllFeaturesData({isExpired: true});
                    cookies.removeCookie(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE);

                    userFeatures._.refresh();
                    expect(userFeatures._.requestNewData).toHaveBeenCalled();
                });

                it('Performs an update if the ad-free state is missing', function() {
                    // Set everything except the ad-free cookie
                    setAllFeaturesData({isExpired: true});
                    cookies.removeCookie(PERSISTENCE_KEYS.AD_FREE_USER_COOKIE);

                    userFeatures._.refresh();
                    expect(userFeatures._.requestNewData).toHaveBeenCalled();
                });

            });

            describe('If user signed out', function () {
                beforeEach(function () {
                    identityApi.isUserLoggedIn = function () {return false;};
                });

                it('Does not perform update, even if feature data missing', function () {
                    deleteAllFeaturesData();
                    userFeatures._.refresh();
                    expect(userFeatures._.requestNewData).not.toHaveBeenCalled();
                });

                it('Deletes leftover feature data', function () {
                    setAllFeaturesData({isExpired: false});
                    userFeatures._.refresh();
                    expect(userFeatures.deleteOldData).toHaveBeenCalled();
                });
            });
        });


        describe('The isPayingMember getter', function () {
            it('Is false when the user is logged out', function () {
                identityApi.isUserLoggedIn = function () {return false;};
                expect(userFeatures.isAdFreeUser).toBe(false);
            });

            describe('When the user is logged in', function () {
                beforeEach(function () {
                    identityApi.isUserLoggedIn = function () {return true;};
                });

                it('Is true when the user has a `true` paying member cookie', function () {
                    cookies.addCookie(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE, true);
                    expect(userFeatures.isPayingMember()).toBe(true);
                });

                it('Is false when the user has a `false` paying member cookie', function () {
                    cookies.addCookie(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE, false);
                    expect(userFeatures.isPayingMember()).toBe(false);
                });

                it('Is true when the user has no paying member cookie', function () {
                    // If we don't know, we err on the side of caution, rather than annoy paying users
                    cookies.removeCookie(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE);
                    expect(userFeatures.isPayingMember()).toBe(true);
                });
            });
        });

        describe('Deleting old feature data', function () {
            beforeEach(function () {
                // Unspy method to test it
                userFeatures._.deleteOldData.and.callThrough();
            });

            it('Removes all cookies', function () {
                setAllFeaturesData({isExpired: false});
                userFeatures._.deleteOldData();

                expect(cookies.getCookie(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE)).toBeNull();
                expect(cookies.getCookie(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE)).toBeNull();
            });
        });

        describe('Storing new feature data', function () {
            var serverResponse;

            beforeEach(function () {
                deleteAllFeaturesData();

                serverResponse = {
                    adblockMessage : false
                };

                // Unspy method to test it
                userFeatures._.persistResponse.and.callThrough();
            });

            it('Puts the paying-member state in a cookie, so that membership-frontend can wipe it', function () {
                serverResponse.adblockMessage = true;
                userFeatures._.persistResponse(serverResponse);
                expect(cookies.getCookie(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE)).toBe('false');

                serverResponse.adblockMessage = false;
                userFeatures._.persistResponse(serverResponse);
                expect(cookies.getCookie(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE)).toBe('true');
            });

            it('Puts an expiry date in an accompanying cookie', function () {
                userFeatures._.persistResponse(serverResponse);
                var expiryDate = cookies.getCookie(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE);
                expect(expiryDate).not.toBeNull();
            });

            it('The expiry date can be parsed into a Unix epoch', function () {
                userFeatures._.persistResponse(serverResponse);
                var expiryDateString = cookies.getCookie(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE);
                expect(isNaN(expiryDateString)).toBe(false);
            });

            it('The expiry date is in the future', function () {
                var expiryDateString, expiryDateEpoch, currentTimeEpoch;

                userFeatures._.persistResponse(serverResponse);

                expiryDateString = cookies.getCookie(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE);
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

            cookies.addCookie(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE, true);
            cookies.addCookie(PERSISTENCE_KEYS.AD_FREE_USER_COOKIE, false);
            cookies.addCookie(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE, expiryDate.getTime());
        }

        function deleteAllFeaturesData() {
            cookies.removeCookie(PERSISTENCE_KEYS.PAYING_MEMBER_COOKIE);
            cookies.removeCookie(PERSISTENCE_KEYS.USER_FEATURES_EXPIRY_COOKIE);
            cookies.removeCookie(PERSISTENCE_KEYS.AD_FREE_USER_COOKIE);
        }
    });
});
