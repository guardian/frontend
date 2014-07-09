define(['common/utils/ajax'], function (ajax) {

    var config = {
        page: {
            ajaxUrl: "http://m.guardian.co.uk",
            edition: "UK"
        }
    };

    describe("AJAX Wrapper", function () {

        beforeEach(function () {
            sinon.stub(ajax, 'reqwest');
            ajax.init(config);
        });

        afterEach(function () {
            ajax.reqwest.restore();
        });

        it("should proxy calls to reqwest", function () {
            expect(ajax.reqwest.callCount).toBe(0);
            ajax({
                url: "/foo"
            });
            expect(ajax.reqwest.callCount).toBe(1);
            expect(ajax.reqwest.getCall(0).args[0]["url"]).toBe("http://m.guardian.co.uk/foo");
        });

        it("should not touch a url that is already absolute", function () {
            ajax({
                url: "http://apis.guardian.co.uk/test-url"
            });
            expect(ajax.reqwest.getCall(0).args[0]["url"]).toBe("http://apis.guardian.co.uk/test-url");
        });

        it("should not touch a url that is already absolute (https)", function () {
            ajax({
                url: "https://apis.guardian.co.uk/test-url"
            });
            expect(ajax.reqwest.getCall(0).args[0]["url"]).toBe("https://apis.guardian.co.uk/test-url");
        });
    });

});
