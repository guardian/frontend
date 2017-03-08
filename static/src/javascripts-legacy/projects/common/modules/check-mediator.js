define([
    'Promise',
    'lodash/collections/map'
    ], function (
    Promise,
    map
) {

    /**
     * registeredChecks will store references to instances of DefferedCheck
    **/
    var registeredChecks = {};

    /**
     * referenced as passCondition for dependentChecks
     * SOMECHECKSPASSED: At least one dependentCheck has returned true
     * EVERYCHECKPASSED: Every dependentCheck has returned true
    **/
    var SOMECHECKSPASSED = Array.prototype.some;
    var EVERYCHECKPASSED = Array.prototype.every;

    /**
     * checkList is an array of object literals.
     * Each object in this array will be converted to a DefferedCheck and added to registeredChecks
     * Each object contains 2 fields: id (string) and dependentChecks (object)
     * dependentChecks should contain 2 fields: passCondition (SOMECHECKSPASSED/EVERYCHECKPASSED), list (nested array of checks)
     * If object has dependentChecks then the DefferedCheck will resolve when these dependentChecks have all resolved
     *
    **/
    var checkList = [{
            id: 'isOutbrainNonCompliant',
            dependentChecks: {
                passCondition: SOMECHECKSPASSED,
                list:[{
                    id: 'isUserInContributionsAbTest'
                }, {
                    id: 'canEmailBeInserted',
                    dependentChecks: {
                        passCondition: EVERYCHECKPASSED,
                        list: [{ 
                            id: 'isUserInEmailAbTest' 
                        }, {
                            id: 'emailCanRunPreCheck'
                        }, {
                            id: 'listCanRun'
                        }, {
                            id: 'emailInArticleOutbrainEnabled'
                        }]
                    }
                }]
            }
        }, {
            id: 'emailCanRun',
            dependentChecks: {
                passCondition: EVERYCHECKPASSED,
                list: [{ 
                    id: 'isOutbrainNonCompliant' 
                }, { 
                    id: 'emailCanRunPreCheck' 
                }, { 
                    id: 'listCanRun' 
                }, { 
                    id: 'emailInArticleOutbrainEnabled' 
                }]
            }
        }];

    function DeferredCheck(dependentCheckPromises, dependentChecksPassCondition) {
        this.complete = new Promise(function(resolve, reject) {
            this.resolve = resolve;
            this.reject = reject;
        }.bind(this));

        if (dependentCheckPromises) {
            Promise.all(dependentCheckPromises).then(function(results) {

                var hasPassed = function(result) {
                    return result;
                };

                this.resolve(dependentChecksPassCondition.call(results, hasPassed));
            }.bind(this));
        }
    }

    function registerDefferedCheck(check) {
        if (check.dependentChecks) {
          return new DeferredCheck(map(check.dependentChecks.list, registerDependentCheck), check.dependentChecks.passCondition);
        }

        return new DeferredCheck();
    }

    function registerDependentCheck(dependentCheck) {
        return registerCheck(dependentCheck).complete;
    }    
  
    function registerCheck(check) {
        if (registeredChecks[check.id]) {
            return registeredChecks[check.id];
        }

        var registeredCheck = registerDefferedCheck(check);

        registeredChecks[check.id] = registeredCheck;

        return registeredCheck;
    }

    /**
     * public
    **/
    function init() {
        checkList.forEach(registerCheck);
    }
    
    function resolveCheck(id) {
        var argsArray = Array.prototype.slice.call(arguments, 1);
        
        if (registeredChecks[id]) {
            return registeredChecks[id].resolve.apply(null, argsArray);
        }
    }

    function waitForCheck(id) {
        if (registeredChecks[id]) {
            return registeredChecks[id].complete;
        }

        return Promise.reject('no deferred check with id ' + id);
    }

    /**
     * exposed for unit testing
    **/
    function _testRegisterCheck(check) {
        var registeredCheck;

        registeredCheck = registerDefferedCheck(check);

        registeredChecks[check.id] = registeredCheck;
    }

    return {
        init: init,
        resolveCheck: resolveCheck,
        waitForCheck: waitForCheck,
        _testRegisterCheck: _testRegisterCheck // exposed for unit testing
    };
});
