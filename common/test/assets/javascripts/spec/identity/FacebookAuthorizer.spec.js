define([
    "bonzo",
    "modules/identity/facebook-authorizer"
], function(
    bonzo,
    FacebookAuthorizer
) {
    describe('Facebook Authorizer', function(){

        var authorizer, userDetailsCallBack,userData = {},loginResponse = {status: 'unknown'};

        beforeEach(function() {

            userDetailsCallBack = sinon.stub();

            authorizer = new FacebookAuthorizer("123");

            authorizer._loadFacebookScript = function () {
                console.log("++ Load scripts " + window);
                window.FB = {
                    api: sinon.spy(function (path, callback) {
                        callback(userData);
                    }),
                    login: sinon.spy(function (callback, permissions) {
                        callback(loginResponse);
                    }),
                    getLoginStatus: sinon.spy(function (callback) {
                        callback(loginResponse);
                    }),
                    init: sinon.stub()
                };
            };

            authorizer.onUserDataLoaded.then(userDetailsCallBack);
            sinon.spy(authorizer, "getLoginStatus");
        });

        afterEach(function() {
           delete window.FB;
           authorizer.destroy();
           bonzo('meta').remove();
           bonzo('.facebook-jssdk').remove();
        });

        function whenTheScriptLoads() {
           authorizer._handleScriptLoaded();
        }

        describe("Get Login Status", function() {
            it('Should call facebook init after loading the facebook script', function() {
                authorizer.getLoginStatus();
                console.log(window.FB);
                whenTheScriptLoads();
                expect(FB.init.callCount).toBe(1);
            });

            it('Does not load the facebook script or call FB.init more than once', function() {
                authorizer.getLoginStatus();
                whenTheScriptLoads();
                expect(FB.init.callCount).toEqual(1);
                authorizer.getLoginStatus();    1
                expect(FB.init.callCount).toEqual(1);
            });

            it('Should queue calls to get login status', function() {

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

            it("Should load facebook api if requested to auth the user", function() {

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

            it("should not try to login to facebook more than once", function() {
                authorizer.login();
                authorizer.login();

                whenTheScriptLoads();
                expect(FB.login.callCount).toEqual(1);
            });

            it("Should get the user data from facebook", function() {
                loginResponse = { status : 'not_authorized'};

                userData = {"name" : "Scala refugee"};

                authorizer.getLoginStatus();

                whenTheScriptLoads();

                expect(userDetailsCallBack.callCount).toEqual(1);
                expect(userDetailsCallBack.getCall(0).args[0]).toBe(userData);
            });

            it("Should not get the user data user when an error occurs", function() {
                loginResponse = { status : 'not_authorized'};

                userData = {"error" : "badness happened"};

                authorizer.getLoginStatus();

                expect(userDetailsCallBack.callCount).toEqual(0);

            });
        });

    });
});