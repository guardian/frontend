define([
    'lib/robust'
], function (
    robust
) {
    describe('Robust', function () {
        it('should complete successfully', function (done) {
            robust.catchErrorsAndLog('test', done);
        });

        it('should log and swallow exceptions', function () {
            function buggyModule() {
                throw new Error('fail');
            }

            robust.catchErrorsAndLog('test', buggyModule, function (ex, meta) {
                expect(ex.message).toBe('fail');
                expect(meta.module).toBe('test');
            });
        });
    });
});

