// @flow

import timeout from 'lib/timeout';

function wait(time) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

describe('timeout', () => {
    test(
        "resolves with the promised value if the timeout doesn't fire",
        done => {
            timeout(10, Promise.resolve(12))
                .then(result => {
                    expect(result).toBe(12);
                    return wait(10);
                })
                .then(done)
                .catch(done.fail);
        }
    );

    test(
        "rejects with the promised error if the timeout doesn't fire",
        done => {
            timeout(10, Promise.reject(new Error('too bad')))
                .then(done.fail)
                .catch(error => {
                    expect(error.message).toBe('too bad');
                    return wait(10);
                })
                .then(done)
                .catch(done.fail);
        }
    );

    test('rejects with timeout if promise never returns', done => {
        timeout(10, new Promise(() => {}))
            .then(done.fail)
            .catch(error => {
                expect(error.message).toMatch(/timeout/i);
                return wait(10);
            })
            .then(done)
            .catch(done.fail);
    });

    test('rejects with timeout if promise resolves too late', done => {
        timeout(10, wait(40))
            .then(done.fail)
            .catch(error => {
                expect(error.message).toMatch(/timeout/i);
                return wait(40);
            })
            .then(done)
            .catch(done.fail);
    });
});
