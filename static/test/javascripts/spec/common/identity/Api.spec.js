define([
    'jasq'
], function () {

    var reqwestStub, reqwestReturn, getCookieStub, getStorageStub;

    describe('Get user data', {
        moduleName: 'common/modules/identity/api',
        mock: function () {
            return {
                'reqwest': function () {
                    reqwestStub = sinon.stub();
                    reqwestReturn = {
                        then: sinon.stub()
                    };

                    reqwestStub.returns(reqwestReturn);

                    return reqwestStub
                },
                'common/utils/config': function () {
                    return {
                        page: {
                            idApiUrl: 'https://idapi.theguardian.com',
                            idUrl:    'https://profile.theguardian.com'
                        }
                    };
                },
                'common/utils/cookies': function () {
                    getCookieStub = sinon.stub();
                    getCookieStub.withArgs('GU_U').returns(
                        'WyIyMzEwOTU5IiwiamdvcnJpZUBnbWFpbC5jb20iLCJqYW1lc2dvcnJpZSIsIjUzNCIsMTM4Mjk1MzAzMTU5MSwxXQ.MC0CFBsFwIEITO91EGONK4puyO2ZgGQcAhUAqRa7PVDCoAjrbnJNYYvMFec4fAY'
                    );

                    return {
                        get: getCookieStub
                    };
                },
                'common/utils/storage': function () {
                    getStorageStub = sinon.stub();

                    return {
                        local: {
                            get: getStorageStub
                        }
                    };
                }
            }
        },
        specify: function () {

            it('gets user from cookie', function (Id) {
                expect(Id.getUserFromCookie().displayName).toBe('jamesgorrie');
            });

            it('decodes a base64 string', function (Id) {
                var string        = 'sammandoo',
                    encodedString = window.btoa(string),
                    decodedString = Id.decodeBase64(encodedString);

                expect(decodedString).toBe(string);
            });

            it('gets user from the idapi', function (Id) {
                var apiCallback  = sinon.spy(),
                    expectedUser = {};

                reqwestReturn.then.callsArgWith(
                    0,
                    {
                        'status' : 'ok',
                        'user' : expectedUser
                    }
                );

                Id.init();
                Id.getUserFromApi(apiCallback);

                expect(apiCallback).toHaveBeenCalledWith(expectedUser);
                expect(reqwestStub).toHaveBeenCalledWith({
                    url:         'https://idapi.theguardian.com/user/me',
                    type:        'jsonp',
                    crossOrigin: true
                });
            });

            it('should not call api if the cookie does not exist', function (Id) {
                getCookieStub.withArgs('GU_U').returns(null);
                var apiCallback = sinon.spy();

                Id.getUserFromApi(apiCallback);

                expect(apiCallback).toHaveBeenCalledWith(null);
                expect(reqwestStub).not.toHaveBeenCalled();
            });

            it('should redirect to sign in when user is not signed in', function (Id) {
                getCookieStub.withArgs('GU_U').returns(null);
                var redirectSpy = sinon.stub(Id, 'redirectTo');

                Id.getUserOrSignIn();

                expect(redirectSpy).toHaveBeenCalled();
            });

            it('should not redirect to sign in when user is already signed in', function (Id) {
                var redirectSpy = sinon.stub(Id, 'redirectTo'),
                    user        = Id.getUserOrSignIn();

                expect(user.displayName).toBe('jamesgorrie');
                expect(redirectSpy).not.toHaveBeenCalled();
            });

            it('should redirect with return URL when given', function (Id) {
                getCookieStub.withArgs('GU_U').returns(null);
                var redirectSpy = sinon.stub(Id, 'redirectTo'),
                    returnUrl   = 'http://www.theguardian.com/foo';

                Id.getUserOrSignIn(returnUrl);

                expect(redirectSpy.getCall(0).args[0]).toContain(encodeURIComponent(returnUrl));
            });

            it('should attempt to autosigin an user who is not currently signed in and has not previously signed out', function (Id) {
                getCookieStub.withArgs('GU_U').returns(null);
                getCookieStub.withArgs('GU_SO').returns(null);
                getStorageStub.withArgs('gu.id.nextFbCheck').returns('blah|blah');

                expect(Id.shouldAutoSigninInUser()).toBe(false);
            });

            it('should not attempt to autosigin a user who is not currently signed in, has not previously signed out, before the facebook check overlaps', function (Id) {
                getCookieStub.withArgs('GU_U').returns(null);
                getCookieStub.withArgs('GU_SO').returns(null);

                expect(Id.shouldAutoSigninInUser()).toBe(true);
            });

            it('should not attempt to autosignin a signed in user', function (Id) {
                expect(Id.shouldAutoSigninInUser()).toBe(false);
            });

            it('should attempt to autosignin a user who has signed out more than 24 hours ago after the facebook check has ellapsed', function (Id) {
                var today                 = new Date(),
                    theDayBeforeYesterday = new Date();

                theDayBeforeYesterday.setDate(today.getDate() - 2);

                var timeStampInSeconds = theDayBeforeYesterday.getTime() / 1000;
                getCookieStub.withArgs('GU_U').returns(null);
                getCookieStub.withArgs('GU_SO').returns(timeStampInSeconds.toString);

                expect(Id.shouldAutoSigninInUser()).toBe(true);
            });

            it('should not attempt to autosignin a user who has signed out more than 24 hours ago before the facebook check has ellapsed', function (Id) {
                var theDayBeforeYesterday = new Date();
                theDayBeforeYesterday.setDate(new Date().getDate() - 2);

                var timeStampInSeconds = theDayBeforeYesterday.getTime() / 1000;

                getCookieStub.withArgs('GU_U').returns(null);
                getCookieStub.withArgs('GU_SO').returns(timeStampInSeconds.toString);
                getStorageStub.withArgs('gu.id.nextFbCheck').returns('blah|blah');

                expect(Id.shouldAutoSigninInUser()).toBe(false);
            });

            it('should not attempt to autosignin a user who has signed out within the last 24 hours', function (Id) {
                var fourHoursAgo = new Date();
                fourHoursAgo.setHours(new Date().getHours() - 4);

                var timeStampInSeconds = fourHoursAgo.getTime() / 1000;

                getCookieStub.withArgs('GU_U').returns(null);
                getCookieStub.withArgs('GU_SO').returns(timeStampInSeconds.toString());

                expect(Id.shouldAutoSigninInUser()).toBe(false);
            });

        }
    });

});
