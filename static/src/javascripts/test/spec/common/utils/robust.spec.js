import Promise from 'Promise';
import robust from 'common/utils/robust';

describe('Robust', function() {
    it('should complete successfully', function (success) {
        robust('test', function () { success(); });
    });

    it('should log and swallow exceptions', function (success) {

        var reporter = function (ex, options) {
            expect(ex.message).toBe('fail');
            expect(options.tags.module).toBe('test');
            success();
        };

        robust('test',
            function () { throw new Error('fail'); },
            reporter
        );
    });
});


