define([
    'common/utils/robust'
], function (
    robust
) {
    describe('Robust', function () {
        it('should complete successfully', function (success) {
            robust.catchErrorsAndLog('test', function () { success(); });
        });

        it('should log and swallow exceptions', function (success) {

            var reporter = function (ex, meta) {
                expect(ex.message).toBe('fail');
                expect(meta.module).toBe('test');
                success();
            };

            robust.catchErrorsAndLog('test',
                function () { throw new Error('fail'); },
                reporter
            );
        });
    });
});

