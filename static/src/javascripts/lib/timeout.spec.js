// @flow

import Chance from 'chance';
import timeout from 'lib/timeout';

const chance = new Chance();

const wait = time =>
    new Promise(resolve => {
        setTimeout(resolve, time);
    });

describe('timeout', () => {
    test("resolves with the promised value if the timeout doesn't fire", done => {
        const time = chance.integer({ min: 0, max: 10 });
        const value = chance.integer();

        timeout(time, Promise.resolve(value))
            .then(result => {
                expect(result).toBe(value);
                return wait(time);
            })
            .then(done)
            .catch(done.fail);
    });

    test("rejects with the promised error if the timeout doesn't fire", done => {
        const time = chance.integer({ min: 0, max: 10 });
        const message = chance.sentence();

        timeout(time, Promise.reject(new Error(message)))
            .then(done.fail)
            .catch(error => {
                expect(error.message).toBe(message);
                return wait(time);
            })
            .then(done)
            .catch(done.fail);
    });

    test('rejects with timeout if promise never returns', done => {
        const time = chance.integer({ min: 0, max: 10 });

        timeout(time, new Promise(() => {}))
            .then(done.fail)
            .catch(error => {
                expect(error.message).toMatch(/timeout/i);
                return wait(time);
            })
            .then(done)
            .catch(done.fail);
    });

    test('rejects with timeout if promise resolves too late', done => {
        const time = chance.integer({ min: 0, max: 10 });
        const waitTime = chance.integer({ min: 11, max: 25 });

        timeout(time, wait(waitTime))
            .then(done.fail)
            .catch(error => {
                expect(error.message).toMatch(/timeout/i);
                return wait(waitTime);
            })
            .then(done)
            .catch(done.fail);
    });
});
