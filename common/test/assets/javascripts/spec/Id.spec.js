define([
    'common',
    'modules/cookies',
    'modules/id',
    'modules/storage',
    'ajax'
], function(
    common,
    Cookies,
    Id,
    Storage,
    ajax
) {
    describe('Get user data', function() {
        var cookieData = 'WyIyMzEwOTU5IiwiamdvcnJpZUBnbWFpbC5jb20iLCJqYW1lc2dvcnJpZSIsIjUzNCIsMTM4Mjk1MzAzMTU5MSwxXQ.MC0CFBsFwIEITO91EGONK4puyO2ZgGQcAhUAqRa7PVDCoAjrbnJNYYvMFec4fAY';
        var config = {
            'page' : {
                'idApiUrl' : "https://idapi.theguardian.com"
            }
        };

        var reqwestReturn = {'then':function(){}}

        beforeEach(function () {
            sinon.stub(ajax, 'reqwest');
            sinon.stub(reqwestReturn, 'then');
            sinon.stub(Cookies, 'get');
            localStorage.clear();

            ajax.reqwest.returns(reqwestReturn);
            ajax.init(config);

            Id.init(config);
            Id.reset();
        });

        afterEach(function () {
            ajax.reqwest.restore();
            Cookies.get.restore();
            reqwestReturn.then.restore();
        });


        it ('gets user from cookie', function() {
            Cookies.get.withArgs("GU_U").returns(cookieData);

            var user = Id.getUserFromCookie();
            expect(user.displayName).toBe('jamesgorrie');
        });

        it ('decodes a base64 string', function() {
            var string = 'sammandoo',
                encodedString = window.btoa(string),
                decodedString = Id.decodeBase64(encodedString);

            expect(decodedString).toBe(string);
        });

        it ('gets user from the idapi', function() {
            Cookies.get.withArgs("GU_U").returns(cookieData);

            var expectedUser = {};

            reqwestReturn.then.callsArgWith(
                0,
                {
                    'status' : 'ok',
                    'user' : expectedUser
                }
            );

            var apiCallback = sinon.spy();
            var user = Id.getUserFromApi(apiCallback);

            expect(apiCallback.getCall(0).args[0]).toBe(expectedUser)

            expect(ajax.reqwest.getCall(0).args[0]["url"]).toBe("https://idapi.theguardian.com/user/me?_edition=undefined");
            expect(ajax.reqwest.getCall(0).args[0]["type"]).toBe("jsonp");
            expect(ajax.reqwest.getCall(0).args[0]["crossOrigin"]).toBe(true);
        });

        it ('should not call api if the cookie does not exist', function() {
            var apiCallback = sinon.spy();
            var user = Id.getUserFromApi(apiCallback);
            expect(apiCallback.getCall(0).args[0]).toBeNull();

            expect(ajax.reqwest.callCount).toBe(0);
        });

        it ('gets user from the idapi', function() {
            Cookies.get.withArgs("GU_U").returns(cookieData);

            var expectedUser = {};

            reqwestReturn.then.callsArgWith(
                0,
                {
                    'status' : 'ok',
                    'user' : expectedUser
                }
            );

            var apiCallback = sinon.spy();
            var user = Id.getUserFromApi(apiCallback);

            expect(apiCallback.getCall(0).args[0]).toBe(expectedUser)

            expect(ajax.reqwest.getCall(0).args[0]["url"]).toBe("https://idapi.theguardian.com/user/me?_edition=undefined");
            expect(ajax.reqwest.getCall(0).args[0]["type"]).toBe("jsonp");
            expect(ajax.reqwest.getCall(0).args[0]["crossOrigin"]).toBe(true)
        });

        it("should attempt to autosigin an user who is not signed in and has not signed out", function(){
            Cookies.get.withArgs("GU_U").returns(null);
            Cookies.get.withArgs("GU_SO").returns(null);

            expect(Id.shouldAutoSigninInUser()).toBe(true);
        });

        it("should not attempt to autosignin a signed in user", function(){
            Cookies.get.withArgs("GU_U").returns(cookieData);

            expect(Id.shouldAutoSigninInUser()).toBe(false);
        });

        it("should attempt to autosignin a user who has signed out more than 24 hours ago after the facebook check has ellapsed", function() {
            var today = new Date(),
                theDayBeforeYesterday = new Date();
            theDayBeforeYesterday.setDate(today.getDate() - 2);
            var timeStampInSeconds = theDayBeforeYesterday.getTime() / 1000;
            Cookies.get.withArgs("GU_SO").returns(timeStampInSeconds.toString);

            expect(Id.shouldAutoSigninInUser()).toBe(true);
        });

        it("should not attempt to autosignin a user who has signed out more than 24 hours ago before the facebook check has ellapsed", function() {
            var theDayBeforeYesterday = new Date();
            theDayBeforeYesterday.setDate(new Date().getDate() - 2);
            var timeStampInSeconds = theDayBeforeYesterday.getTime() / 1000;
            Cookies.get.withArgs("GU_SO").returns(timeStampInSeconds.toString);
            Storage.local.set("gu.id.nextFbCheck","blah|blah");

            expect(Id.shouldAutoSigninInUser()).toBe(false);
        });

        it("should not attempt to autosignin a user who has signed out within the last 24 hours", function() {
            var fourHoursAgo = new Date();
            fourHoursAgo.setHours(new Date().getHours() - 4);
            var timeStampInSeconds = fourHoursAgo.getTime() / 1000;

            Cookies.get.withArgs("GU_SO").returns(timeStampInSeconds.toString());

            expect(Id.shouldAutoSigninInUser()).toBe(false);
        });
    });
})
