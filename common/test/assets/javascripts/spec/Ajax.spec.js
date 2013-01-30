define(['common', 'ajax'], function(common, ajax) {

    describe("AJAX Wrapper", function() {

        beforeEach(function() {
            ajax.reqwest = sinon.stub()
        });

        it("should proxy calls to reqwest", function() {
            expect(ajax.reqwest.callCount).toBe(0);
            ajax({
                url: "/foo"
            });
            expect(ajax.reqwest.callCount).toBe(1);
            expect(ajax.reqwest.getCall(0).args[0]["url"]).toBe("/foo");
        });

    });

});
