define([
    'common/utils/check-mediator'
], function (
    checkMediator
) {
    describe('Check Mediator', function () {
        var checkList = [{
                id: 'check-1',
                canRun: true,
                dependentChecks: []
            }, {
                id: "check-2",
                canRun: true,
                dependentChecks: [{
                    id: "check-3",
                    canRun: true,
                    dependentChecks: []
                }, {
                    id: "check-4",
                    canRun: true,
                    dependentChecks: []
                }]
            }, {
                id: "check-5",
                canRun: true,
                dependentChecks: [{
                    id: "check-6",
                    canRun: false,
                    dependentChecks: []
                }, {
                    id: "check-7",
                    canRun: true,
                    dependentChecks: []
                }]
            }];

        beforeAll(function () {
            checkList.forEach(checkMediator.test.registerCheck);
        });

        it('resolves a check with no dependent checks', function (done) {
            checkMediator.waitForCheck('check-1')
            .then(function(result) {
                expect(result).toBe('result-1');

                done();
            });

            checkMediator.resolveCheck('check-1', 'result-1');
        });

        it('resolves a check with multiple dependent checks', function (done) {            
            checkMediator.waitForCheck('check-2')
            .then(function(resultList) {
                expect(resultList.length).toBe(2);
                expect(resultList[0]).toBe('result-3');
                expect(resultList[1]).toBe('result-4');

                done();
            });

            checkMediator.resolveCheck('check-3', 'result-3');
            checkMediator.resolveCheck('check-4', 'result-4');
        });

        it('resolves a check with multiple dependent checks if dependent check canRun equals false', function (done) {            
            checkMediator.waitForCheck('check-5')
            .then(function(resultList) {
                expect(resultList.length).toBe(1);
                expect(resultList[0]).toBe('result-7');

                done();
            });

            checkMediator.resolveCheck('check-6', 'result-6');
            checkMediator.resolveCheck('check-7', 'result-7');
        });

        it('rejects a check if not registered', function (done) {           
            checkMediator.waitForCheck('check-666')
            .catch(function(error) {
                expect(error).toBe('no deferred check with id check-666');

                done();
            });
        });
    });
});
