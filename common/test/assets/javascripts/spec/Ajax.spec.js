define(['common', 'ajax'], function (common, ajax) {

    var config = {
        page: {
            ajaxUrl: "http://m.guardian.co.uk",
            edition: "UK"
        }
    };

    describe("AJAX Wrapper", function () {

        beforeEach(function () {
            ajax.reqwest = sinon.stub();
            ajax.init(config);
        });

        it("should add the edition as a query parameter to the url", function () {
            ajax({
                url: "http://apis.guardian.co.uk/test-url?a=b"
            });
            expect(ajax.reqwest.getCall(0).args[0]["url"]).toBe("http://apis.guardian.co.uk/test-url?a=b&_gu_edition=UK");
        });

        it("should proxy calls to reqwest", function () {
            expect(ajax.reqwest.callCount).toBe(0);
            ajax({
                url: "/foo"
            });
            expect(ajax.reqwest.callCount).toBe(1);
            expect(ajax.reqwest.getCall(0).args[0]["url"]).toBe("http://m.guardian.co.uk/foo?_gu_edition=UK");
        });

        it("should not touch a url that is already absolute", function () {
            ajax({
                url: "http://apis.guardian.co.uk/test-url"
            });
            expect(ajax.reqwest.getCall(0).args[0]["url"]).toBe("http://apis.guardian.co.uk/test-url?_gu_edition=UK");
        });
    });

});
