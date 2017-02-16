define([
    'common/utils/check-mediator'
], function (
    checkMediator
) {
    describe('Check Mediator', function () {
        var SOMECHECKSPASSED = Array.prototype.some;
        var EVERYCHECKPASSED = Array.prototype.every;

        var checkList = [{
                id: 'check-1',
                canRun: true
            }, {
                id: "check-2",
                canRun: true,
                dependentChecks: {
                    passCondition: EVERYCHECKPASSED,
                    list: [{
                        id: "check-3",
                        canRun: true
                    }, {
                        id: "check-4",
                        canRun: true
                    }]
                }
            }, {
                id: "check-5",
                canRun: true,
                dependentChecks: {
                    passCondition: EVERYCHECKPASSED,
                    list: [{
                        id: "check-6",
                        canRun: true
                    }, {
                        id: "check-7",
                        canRun: true
                    }]
                }
            }, {
                id: "check-8",
                canRun: true,
                dependentChecks: {
                    passCondition: EVERYCHECKPASSED,
                    list: [{
                        id: "check-9",
                        canRun: false
                    }, {
                        id: "check-10",
                        canRun: true
                    }]
                }
            }, {
                id: "check-11",
                canRun: true,
                dependentChecks: {
                    passCondition: SOMECHECKSPASSED,
                    list: [{
                        id: "check-12",
                        canRun: true
                    }, {
                        id: "check-13",
                        canRun: true
                    }]
                }
            }];

        beforeAll(function () {
            checkList.forEach(checkMediator._testRegisterCheck);
        });

        it('resolves a check with no dependent checks', function (done) {
            checkMediator.waitForCheck('check-1')
            .then(function(result) {
                expect(result).toBe(true);

                done();
            });

            checkMediator.resolveCheck('check-1', true);
        });

        it('resolves a check with dependent checks as true when passCondition is EVERYCHECKPASSED', function (done) {            
            checkMediator.waitForCheck('check-2')
            .then(function(result) {
                expect(result).toBe(true);

                done();
            });

            checkMediator.resolveCheck('check-3', true);
            checkMediator.resolveCheck('check-4', true);
        });

        it('resolves a check with dependent checks as false when passCondition is EVERYCHECKPASSED', function (done) {            
            checkMediator.waitForCheck('check-5')
            .then(function(result) {
                expect(result).toBe(false);

                done();
            });

            checkMediator.resolveCheck('check-6', true);
            checkMediator.resolveCheck('check-7', false);
        });


        it('resolves a check with dependent checks as true when passCondition is SOMECHECKSPASSED', function (done) {            
            checkMediator.waitForCheck('check-11')
            .then(function(result) {
                expect(result).toBe(true);

                done();
            });

            checkMediator.resolveCheck('check-12', true);
            checkMediator.resolveCheck('check-13', false);
        });

        it('resolves a check with dependent checks as true if dependent check canRun equals false', function (done) {            
            checkMediator.waitForCheck('check-8')
            .then(function(result) {
                expect(result).toBe(true);

                done();
            });

            checkMediator.resolveCheck('check-9', false);
            checkMediator.resolveCheck('check-10', true);
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
