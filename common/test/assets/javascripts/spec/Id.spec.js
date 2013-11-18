define(['utils/cookies', 'modules/identity/api', 'utils/ajax'], function(Cookies, Id, ajax) {
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
    });
})
