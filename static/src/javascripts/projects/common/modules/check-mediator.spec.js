// @flow
import checkMediator from './check-mediator';

jest.mock('./check-mediator-checks', () => ['check-1', 'check-2', 'check-3']);

describe('Check Mediator', () => {
    beforeAll(() => {
        checkMediator.init();
    });

    test('resolve a check with true if registered', done => {
        checkMediator.waitForCheck('check-1').then(result => {
            expect(result).toBe(true);
            done();
        });

        checkMediator.resolveCheck('check-1', true);
    });

    test('resolve a check with false if registered', done => {
        checkMediator.waitForCheck('check-2').then(result => {
            expect(result).toBe(false);
            done();
        });

        checkMediator.resolveCheck('check-2', false);
    });

    test('reject a check with a reason if registered', done => {
        checkMediator.waitForCheck('check-3').catch(error => {
            expect(error).toBe('fail');
            done();
        });

        checkMediator.rejectCheck('check-3', 'fail');
    });

    test('rejects a check if not registered', done => {
        checkMediator.waitForCheck('check-666').catch(error => {
            expect(error).toBe('No deferred check with id check-666');
            done();
        });
    });
});
