import dfpOphanTracking from 'common/modules/commercial/dfp-ophan-tracking';

describe('Performance tracking', () => {
    var mockRenderStart, mockGoogletag, originalLogger;

    beforeEach(()=> {
        mockRenderStart = 0;
        mockGoogletag = new MockGoogleTag();
        spyOn(mockGoogletag.debug_log, 'log');
        originalLogger = mockGoogletag.debug_log.log;
    });

    it('Does not break the log method by intercepting it', () => {
        dfpOphanTracking.trackPerformance(mockGoogletag, mockRenderStart);
        mimicGoogletagLogCall(mockGoogletag.debug_log.log);
        expect(originalLogger).toHaveBeenCalled();
    });

    describe('Resilience to changes in the secret debug interface', () => {
        it('Can handle removal of debug_log interface', ()=> {
            delete mockGoogletag.debug_log;
            expect(() => {
                dfpOphanTracking.trackPerformance(mockGoogletag, mockRenderStart);
            }).not.toThrow();
        });

        it('Can handle removal of log method', ()=> {
            delete mockGoogletag.debug_log.log;
            expect(() => {
                dfpOphanTracking.trackPerformance(mockGoogletag, mockRenderStart);
            }).not.toThrow();
        });
    });
});

function MockGoogleTag() {
    this.debug_log = {
        log : noop
    };
    this.pubads = () => ({
        addEventListener : noop
    });

    function noop() {
        // does nothing
    }
}

function mimicGoogletagLogCall(logger) {
    const   mockLevel = 0,
            mockMessage = new MockAdDebugMessage();

    logger(mockLevel, mockMessage);
}

function MockAdDebugMessage() {
    this.getMessageId = () => 123;
}
