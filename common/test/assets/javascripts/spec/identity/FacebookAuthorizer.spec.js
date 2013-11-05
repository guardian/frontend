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

            authorizer._handleScriptLoaded = function() {
                console.log("Handle");
                window.FB.init();
                this.onFBScriptLoaded.resolve(window.FB);
            }

            //authorizer.onFBScriptLoaded = function() { console.log("Resolve"); };
           // authorizer.onUserDataLoaded.then(userDetailsCallBack);
            //userDetailsCallBack = sinon.stub();
            //sinon.spy(authorizer, "getLoginStatus");
        });

        afterEach(function() {
           delete window.FB;
           authorizer.destroy();
           bonzo('meta').remove();
           bonzo('.facebook-jssdk').remove();
        });

        function whenTheScriptLoads() {
            console.log("+++++++++++++  Load");
           authorizer._handleScriptLoaded();
        }

        describe("Get Login Status", function() {
            it('Should call facebook init after loading the facebook script', function() {
                authorizer.getLoginStatus();
                console.log(window.FB);
                whenTheScriptLoads();
                expect(window.FB.init.callCount).toBe(1);
            });

            it('Does not load the facebook script or call FB.init more than once', function() {
                authorizer.getLoginStatus();
                whenTheScriptLoads();
                expect(FB.init.callCount).toEqual(1);
                authorizer.getLoginStatus();    1
                expect(FB.init.callCount).toEqual(1);
            });
        });

    });
});