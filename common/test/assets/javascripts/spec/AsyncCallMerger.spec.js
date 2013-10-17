define(['modules/asyncCallMerger'], function(asyncCallMerger) {
    describe("AsyncCallMerger", function() {
        var targetCallCount;
        var targetFn;
        var targetFnWithMerging;

        beforeEach(function() {
            targetFn = sinon.spy();
            targetFnWithMerging  = asyncCallMerger.mergeCalls(targetFn);
        });

        it("should only call target once", function() {
            targetFnWithMerging(function () {});
            targetFnWithMerging(function () {});

            expect(targetFn.callCount).toEqual(1)
        });

        it("should call both callbacks with result of target callback", function() {
            var callback1 = sinon.spy();
            targetFnWithMerging(callback1);

            var callback2 = sinon.spy();
            targetFnWithMerging(callback2);

            //call callback passed to target fn
            targetFn.getCall(0).args[0]("target result")

            expect(callback1.getCall(0).args).toEqual(["target result"])
            expect(callback2.getCall(0).args).toEqual(["target result"])
        });

        it("should call both callbacks with result of target callback when merged function is called after call to target has completed", function() {
            var callback1 = sinon.spy();
            targetFnWithMerging(callback1);

            //call callback passed to target fn
            targetFn.getCall(0).args[0]("target result")

            var callback2 = sinon.spy();
            targetFnWithMerging(callback2);

            expect(callback1.getCall(0).args).toEqual(["target result"])
            expect(callback2.getCall(0).args).toEqual(["target result"])
        });
    });
});

