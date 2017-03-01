define([
    'Promise',
    'common/utils/timeout'
], function (
    Promise,
    timeout
) {
    function wait (time) {
        return new Promise(function (resolve) {
            setTimeout(resolve, time);
        });
    }

    describe('Timeout utility', function () {
        it('resolves with the promised value if the timeout doesn\'t fire', function (done) {
            timeout(10, Promise.resolve(12))
            .then(function (result) {
                expect(result).toBe(12);
                return wait(10);
            })
            .then(done)
            .catch(done.fail);
        });

        it('rejects with the promised error if the timeout doesn\'t fire', function (done) {
            timeout(10, Promise.reject(new Error('too bad')))
            .then(done.fail)
            .catch(function (error) {
                expect(error.message).toBe('too bad');
                return wait(10);
            })
            .then(done)
            .catch(done.fail);
        });

        it('rejects with timeout if promise never returns', function (done) {
            timeout(10, new Promise(function () {}))
            .then(done.fail)
            .catch(function (error) {
                expect(error.message).toMatch(/timeout/i);
                return wait(10);
            })
            .then(done)
            .catch(done.fail);
        });

        it('rejects with timeout if promise resolves too late', function (done) {
            timeout(10, wait(40))
            .then(done.fail)
            .catch(function (error) {
                expect(error.message).toMatch(/timeout/i);
                return wait(40);
            })
            .then(done)
            .catch(done.fail);
        });
    });
});
