/*global FB*/
define([
    'bonzo',
    'common/modules/identity/facebook-authorizer'
], function (
    bonzo,
    FacebookAuthorizer
) {
    describe('Facebook Authorizer', function () {
        var authorizer,
            loginResponse = {
                status: 'unknown'
            },
            userData = {},
            userDetailsCallBack;

        beforeEach(function () {
            userDetailsCallBack = sinon.stub();
            authorizer = new FacebookAuthorizer('123');

            authorizer._loadFacebookScript = function () {
                window.FB = {
                    api: sinon.spy(function (path, callback) {
                        callback(userData);
                    }),
                    login: sinon.spy(function (callback) {
                        callback(loginResponse);
                    }),
                    getLoginStatus: sinon.spy(function (callback) {
                        callback(loginResponse);
                    }),
                    init: sinon.stub()
                };
            };

            authorizer.onUserDataLoaded.then(userDetailsCallBack);
            sinon.spy(authorizer, 'getLoginStatus');
        });

        afterEach(function () {
            delete window.FB;
            bonzo('meta').remove();
            bonzo('.facebook-jssdk').remove();
        });

        function whenTheScriptLoads() {
            authorizer._handleScriptLoaded();
        }

        describe('Get Login Status', function () {
            it('should call facebook init after loading the facebook script', function () {
                authorizer.getLoginStatus();
                whenTheScriptLoads();

                expect(FB.init.callCount).toBe(1);
            });

            it('does not load the facebook script or call FB.init more than once', function () {
                authorizer.getLoginStatus();
                whenTheScriptLoads();

                expect(FB.init.callCount).toEqual(1);
                authorizer.getLoginStatus();
                expect(FB.init.callCount).toEqual(1);
            });

            it('should queue calls to get login status', function () {
                var callback1 = sinon.stub(), callback2 = sinon.stub();
                loginResponse = {
                    status: 'connected',
                    authResponse: {
                        accessToken: '123',
                        userID: '123456'
                    }
                };

                authorizer.getLoginStatus().then(callback1);
                authorizer.getLoginStatus().then(callback2);
                whenTheScriptLoads();

                expect(callback1.callCount).toEqual(1);
                expect(callback1.getCall(0).args[0]).toBe(window.FB);
                expect(callback1.getCall(0).args[1]).toBe(loginResponse.authResponse);

                expect(callback2.callCount).toEqual(1);
                expect(callback2.getCall(0).args[0]).toBe(window.FB);
                expect(callback1.getCall(0).args[1]).toBe(loginResponse.authResponse);
            });

            it('should load facebook api if requested to auth the user', function () {
                loginResponse = {
                    status: 'connected',
                    authResponse: {
                        accessToken: '123',
                        userID: '123456'
                    }
                };

                authorizer.login();
                whenTheScriptLoads();

                expect(FB.init.callCount).toEqual(1);
                expect(authorizer.accessToken).toEqual('123');
                expect(authorizer.userId).toEqual('123456');
            });

            it('should not try to login to facebook more than once', function () {
                authorizer.login();
                authorizer.login();
                whenTheScriptLoads();

                expect(FB.login.callCount).toEqual(1);
            });

            it('should get the user data from facebook', function () {
                loginResponse = {
                    status : 'not_authorized'
                };

                userData = {
                    'name' : 'Scala refugee'
                };

                authorizer.getLoginStatus();
                whenTheScriptLoads();

                expect(userDetailsCallBack.callCount).toEqual(1);
                expect(userDetailsCallBack.getCall(0).args[0]).toBe(userData);
            });

            it('should not get the user data user when an error occurs', function () {
                loginResponse = {
                    status : 'not_authorized'
                };

                userData = {
                    'error' : 'badness happened'
                };

                authorizer.getLoginStatus();
                expect(userDetailsCallBack.callCount).toEqual(0);
            });
        });
    });
});
