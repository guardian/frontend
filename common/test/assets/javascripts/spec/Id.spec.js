define(['modules/cookies', 'modules/id', 'ajax'], function(Cookies, Id, ajax) {
    var cookieData = 'WyIyMzEwOTU5IiwiamdvcnJpZUBnbWFpbC5jb20iLCJqYW1lc2dvcnJpZSIsIjUzNCIsMTM4Mjk1MzAzMTU5MSwxXQ.MC0CFBsFwIEITO91EGONK4puyO2ZgGQcAhUAqRa7PVDCoAjrbnJNYYvMFec4fAY';
    var config = {
        'page' : {
            'idApiUrl' : "https://idapi.theguardian.com"
        }
    };

    var reqwestReturn = {'then':function(){}}


    beforeEach(function () {
        sinon.stub(ajax, 'reqwest');
        ajax.reqwest.returns(reqwestReturn);
        sinon.stub(reqwestReturn, 'then');

        sinon.stub(Cookies, 'get');
        ajax.init(config);
        Id.init(config);
    });

    afterEach(function () {
        ajax.reqwest.restore();
        Cookies.get.restore();
        reqwestReturn.then.restore();
    });

    describe('Get user data', function() {
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

        it ('does not call api if not cookie is available', function() {
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
    });

})
