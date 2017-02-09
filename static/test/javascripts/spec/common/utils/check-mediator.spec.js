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
            }];

        beforeAll(function () {
            checkList.forEach(checkMediator.test.registerCheck);
        });

        it('resolves a check with no dependent checks', function (done) {
            checkMediator.waitForCheck('check-1')
            .then(function(result) {
                expect(result).toBe(true);

                done();
            });

            checkMediator.resolveCheck('check-1', true);
        });

        it('resolves a check with multiple dependent checks', function (done) {            
            checkMediator.waitForCheck('check-2')
            .then(function(resultList) {
                expect(resultList.length).toBe(2);
                expect(resultList[0]).toBe(true);
                expect(resultList[1]).toBe(false);

                done();
            });

            checkMediator.resolveCheck('check-3', true);
            checkMediator.resolveCheck('check-4', false);
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
