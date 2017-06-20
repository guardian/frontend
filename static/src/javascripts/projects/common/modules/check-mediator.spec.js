// @flow
import {
    initCheckMediator,
    resolveCheck,
    rejectCheck,
    waitForCheck,
} from './check-mediator';

jest.mock('./check-mediator-checks', () => ({
    checks: ['check-1', 'check-2', 'check-3'],
}));

describe('Check Mediator', () => {
    beforeAll(() => {
        initCheckMediator();
    });

    test('resolve a check with true if registered', done => {
        waitForCheck('check-1').then(result => {
            expect(result).toBe(true);
            done();
        });

        resolveCheck('check-1', true);
    });

    test('resolve a check with false if registered', done => {
        waitForCheck('check-2').then(result => {
            expect(result).toBe(false);
            done();
        });

        resolveCheck('check-2', false);
    });

    test('reject a check with a reason if registered', done => {
        waitForCheck('check-3').catch(error => {
            expect(error).toBe('fail');
            done();
        });

        rejectCheck('check-3', 'fail');
    });

    test('rejects a check if not registered', done => {
        waitForCheck('check-666').catch(error => {
            expect(error).toBe('No deferred check with id check-666');
            done();
        });
    });
});
