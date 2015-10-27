define(['common/modules/commercial/dfp-ophan-tracking'], function (dfpOphanTracking) {
    describe('Performance tracking', function () {
        var mockRenderStart, mockGoogletag, originalLogger;

        beforeEach(function () {
            mockRenderStart = 0;
            mockGoogletag = new MockGoogleTag();
            spyOn(mockGoogletag.debug_log, 'log');
            originalLogger = mockGoogletag.debug_log.log;
        });

        it('Does not break the log method by intercepting it', function () {
            dfpOphanTracking.trackPerformance(mockGoogletag, mockRenderStart);
            mimicGoogletagLogCall(mockGoogletag.debug_log.log);
            expect(originalLogger).toHaveBeenCalled();
        });

        describe('Resilience to changes in the secret debug interface', function () {
            it('Can handle removal of debug_log interface', function () {
                delete mockGoogletag.debug_log;
                expect(function () {
                    dfpOphanTracking.trackPerformance(mockGoogletag, mockRenderStart);
                }).not.toThrow();
            });

            it('Can handle removal of log method', function () {
                delete mockGoogletag.debug_log.log;
                expect(function () {
                    dfpOphanTracking.trackPerformance(mockGoogletag, mockRenderStart);
                }).not.toThrow();
            });
        });
    });

    function MockGoogleTag() {
        /*eslint-disable camelcase*/
        this.debug_log = {
            log : noop
        };
        /*eslint-enable camelcase*/

        this.pubads = function () { return { addEventListener : noop }; };

        /*jscs:disable disallowEmptyBlocks*/
        function noop() {
            // does nothing
        }
        /*jscs:enable disallowEmptyBlocks*/
    }

    function mimicGoogletagLogCall(logger) {
        var   mockLevel = 0,
                mockMessage = new MockAdDebugMessage();

        logger(mockLevel, mockMessage);
    }

    function MockAdDebugMessage() {
        this.getMessageId = function () { return 123; };
    }
});
