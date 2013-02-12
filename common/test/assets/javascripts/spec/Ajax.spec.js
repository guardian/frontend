define(['common', 'ajax'], function (common, ajax) {

    describe("AJAX Wrapper", function () {

        beforeEach(function () {
            ajax.reqwest = sinon.stub()
        });

        it("should proxy calls to reqwest", function () {
            ajax.init("http://m.guardian.co.uk");
            expect(ajax.reqwest.callCount).toBe(0);
            ajax({
                url: "/foo"
            });
            expect(ajax.reqwest.callCount).toBe(1);
            expect(ajax.reqwest.getCall(0).args[0]["url"]).toBe("http://m.guardian.co.uk/foo");
        });

        it("should not touch a url that is already absolute", function () {
           ajax.init("http://m.guardian.co.uk");
            ajax({
                url: "http://apis.guardian.co.uk/test-url"
            });
            expect(ajax.reqwest.getCall(0).args[0]["url"]).toBe("http://apis.guardian.co.uk/test-url");
        });
    });

});
