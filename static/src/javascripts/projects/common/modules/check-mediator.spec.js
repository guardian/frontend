// @flow
import checkMediator from './check-mediator';

describe('Check Mediator', () => {
    const SOMECHECKSPASSED = Array.prototype.some;
    const EVERYCHECKPASSED = Array.prototype.every;

    const checkList = [
        {
            id: 'check-1',
        },
        {
            id: 'check-2',
            passCondition: EVERYCHECKPASSED,
            dependentChecks: [
                {
                    id: 'check-3',
                },
                {
                    id: 'check-4',
                },
            ],
        },
        {
            id: 'check-5',
            passCondition: EVERYCHECKPASSED,
            dependentChecks: [
                {
                    id: 'check-6',
                },
                {
                    id: 'check-7',
                },
            ],
        },
        {
            id: 'check-8',
            passCondition: SOMECHECKSPASSED,
            dependentChecks: [
                {
                    id: 'check-9',
                },
                {
                    id: 'check-10',
                },
            ],
        },
    ];

    beforeAll(() => {
        checkList.forEach(checkMediator.test.testRegisterCheck);
    });

    test('resolves a check with no dependent checks', done => {
        checkMediator.waitForCheck('check-1').then(result => {
            expect(result).toBe(true);
            done();
        });

        checkMediator.resolveCheck('check-1', true);
    });

    test(
        'resolves a check with dependent checks as true when passCondition is EVERYCHECKPASSED',
        done => {
            checkMediator.waitForCheck('check-2').then(result => {
                expect(result).toBe(true);
                done();
            });

            checkMediator.resolveCheck('check-3', true);
            checkMediator.resolveCheck('check-4', true);
        }
    );

    test(
        'resolves a check with dependent checks as false when passCondition is EVERYCHECKPASSED',
        done => {
            checkMediator.waitForCheck('check-5').then(result => {
                expect(result).toBe(false);
                done();
            });

            checkMediator.resolveCheck('check-6', true);
            checkMediator.resolveCheck('check-7', false);
        }
    );

    test(
        'resolves a check with dependent checks as true when passCondition is SOMECHECKSPASSED',
        done => {
            checkMediator.waitForCheck('check-8').then(result => {
                expect(result).toBe(true);
                done();
            });

            checkMediator.resolveCheck('check-9', true);
            checkMediator.resolveCheck('check-10', false);
        }
    );

    test('rejects a check if not registered', done => {
        checkMediator.waitForCheck('check-666').catch(error => {
            expect(error).toBe('No deferred check with id check-666');
            done();
        });
    });
});
