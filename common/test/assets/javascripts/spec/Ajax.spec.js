define(['common', 'ajax'], function (common, ajax) {

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

        it("should add the edition as an additional query parameter to the url", function () {
            // added to existing list of parameters
            ajax({
                url: "http://apis.guardian.co.uk/test-url?a=b"
            });
            expect(ajax.reqwest.getCall(0).args[0]["url"]).toBe("http://apis.guardian.co.uk/test-url?a=b&_edition=UK");
        });

        it("should add the edition as the first query parameter to the url", function () {
            // added as first parameter
            ajax({
                url: "http://apis.guardian.co.uk/test-url"
            });
            expect(ajax.reqwest.getCall(0).args[0]["url"]).toBe("http://apis.guardian.co.uk/test-url?_edition=UK");
        });

        it("should proxy calls to reqwest", function () {
            expect(ajax.reqwest.callCount).toBe(0);
            ajax({
                url: "/foo"
            });
            expect(ajax.reqwest.callCount).toBe(1);
            expect(ajax.reqwest.getCall(0).args[0]["url"]).toBe("http://m.guardian.co.uk/foo?_edition=UK");
        });

        it("should not touch a url that is already absolute", function () {
            ajax({
                url: "http://apis.guardian.co.uk/test-url"
            });
            expect(ajax.reqwest.getCall(0).args[0]["url"]).toBe("http://apis.guardian.co.uk/test-url?_edition=UK");
        });

        it("should not touch a url that is already absolute (https)", function () {
            ajax({
                url: "https://apis.guardian.co.uk/test-url"
            });
            expect(ajax.reqwest.getCall(0).args[0]["url"]).toBe("https://apis.guardian.co.uk/test-url?_edition=UK");
        });
    });

});
