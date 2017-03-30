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
     * Each object can contain these 3 fields:
        * id (required, string)
        * passCondition (optional, SOMECHECKSPASSED/EVERYCHECKPASSED)
        * dependentChecks (optional, nested array of checks)
     * If object has dependentChecks then the DefferedCheck will resolve when these dependentChecks have all resolved
     *
    **/
    var checks = [{
        id: 'isOutbrainBlockedByAds',
        passCondition: EVERYCHECKPASSED,
        dependentChecks: [{
            id: 'hasHighPriorityAdLoaded'
        }, {
            id: 'hasLowPriorityAdLoaded'
        }]
    }, {
        id: 'isOutbrainMerchandiseCompliant',
        passCondition: EVERYCHECKPASSED,
        dependentChecks: [{
            id: 'hasHighPriorityAdLoaded'
        }, {
            id: 'hasLowPriorityAdNotLoaded'
        }]
    }, {
        id: 'isOutbrainMerchandiseCompliantOrBlockedByAds',
        passCondition: SOMECHECKSPASSED,
        dependentChecks: [{
            id: 'isOutbrainMerchandiseCompliant'
        }, {
            id: 'isOutbrainBlockedByAds'
        }]
    }, {
        id: 'emailCanRun',
        passCondition: EVERYCHECKPASSED,
        dependentChecks: [{
            id: 'emailCanRunPreCheck'
        }, {
            id: 'listCanRun'
        }, {
            id: 'emailInArticleOutbrainEnabled'
        }, {
            id: 'isUserNotInContributionsAbTest'
        }]
    }, {
        id: 'isUserInEmailAbTestAndEmailCanRun',
        passCondition: EVERYCHECKPASSED,
        dependentChecks: [{
            id: 'isUserInEmailAbTest'
        }, {
            id: 'emailCanRun'
        }]
    }, {
        id: 'isOutbrainNonCompliant',
        passCondition: SOMECHECKSPASSED,
        dependentChecks: [{
            id: 'isUserInContributionsAbTest'
        }, {
            id: 'isUserInEmailAbTestAndEmailCanRun'
        }, {
            id: 'isStoryQuestionsOnPage'
        }]
    }, {
        id: 'emailCanRunPostCheck',
        passCondition: SOMECHECKSPASSED,
        dependentChecks: [{
            id: 'isUserInEmailAbTest'
        }, {
            id: 'isOutbrainMerchandiseCompliantOrBlockedByAds'
        }, {
            id: 'isOutbrainDisabled'
        }, {
            id: 'isStoryQuestionsOnPage'
        }]
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
            return new DeferredCheck(map(check.dependentChecks, registerDependentCheck), check.passCondition);
        }

        return new DeferredCheck();
    }

    function registerDependentCheck(dependentCheck) {
        if (registeredChecks[dependentCheck.id]) {
            return registeredChecks[dependentCheck.id].complete;
        }

        return registerCheck(dependentCheck).complete;
    }

    function registerCheck(check) {
        if (!registeredChecks[check.id]) {
            registeredChecks[check.id] = registerDefferedCheck(check);
        }

        return registeredChecks[check.id];
    }

    /**
     * public
    **/
    function init() {
        checks.forEach(registerCheck);
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

    function _testClean() {
        registeredChecks = {};
    }

    return {
        init: init,
        resolveCheck: resolveCheck,
        waitForCheck: waitForCheck,
        _testRegisterCheck: _testRegisterCheck, // exposed for unit testing
        _testClean: _testClean // exposed for unit testing
    };
});
