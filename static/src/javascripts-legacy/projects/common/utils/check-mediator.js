define([
    'Promise',
    'common/utils/config'
    ], function (
    Promise,
    config
) {

    /**
     * registeredChecks will store references to instances of DefferedCheck
    **/
    var registeredChecks = {};

    /**
     * checkList is an array of object literals.
     * Each object in this array will be converted to a DefferedCheck and added to registeredChecks
     * Each object contains 3 fields: id (string), canRun (boolean), dependentChecks (nested array of checks)
     * If object has dependentChecks then the DefferedCheck will resolve when these dependentChecks have all resolved
     *
    **/
    var checkList = [{
            id: 'isOutbrainNonCompliant',
            canRun: true,
            dependentChecks: [{
                id: 'isUserInAClashingAbTest',
                canRun: true,
                dependentChecks: []
            }, {
                id: 'isEmailInserted',
                canRun: config.switches.emailInArticleOutbrain,
                dependentChecks: []
            }]
        }];

    function DeferredCheck(dependentCheckPromises) {
        if (dependentCheckPromises && dependentCheckPromises.length) {
            this.complete = Promise.all(dependentCheckPromises);
        } else {
            this.complete = new Promise(function(resolve, reject) {
                this.resolve = resolve;
                this.reject = reject;
            }.bind(this));
        }
    }

    function registerDefferedCheck(check) {
        var dependentCheckPromises = [];
        
        check.dependentChecks.forEach(registerDependentCheck.bind(null, dependentCheckPromises));

        return new DeferredCheck(dependentCheckPromises);
    }

    
    function registerDependentCheck(dependentCheckPromises, dependentCheck) {
        var registeredDependentCheck = registerCheck(dependentCheck);

        if (registeredDependentCheck) {
            dependentCheckPromises.push(registeredDependentCheck.complete);
        }
    }    

    function registerCheck(check) {
        var registeredCheck;

        if (!check.canRun) {
            return false;
        }

        registeredCheck = registerDefferedCheck(check);

        registeredChecks[check.id] = registeredCheck;

        return registeredCheck;
    }

    function init() {
        checkList.forEach(registerCheck);
    }

    init();

    /**
     * public
    **/
    function resolveCheck(id) {
        var argsArray = Array.prototype.slice.call(arguments, 1);
        
        if (registeredChecks[id]) {
            return registeredChecks[id].resolve.apply(null, argsArray);
        }
    }

    function rejectCheck(id) {
        var argsArray = Array.prototype.slice.call(arguments, 1);

        if (registeredChecks[id]) {
            return registeredChecks[id].reject.apply(null, argsArray);
        }
    }

    function waitForCheck(id) {
        if (registeredChecks[id]) {
            return registeredChecks[id].complete;
        }

        return Promise.reject('no deferred check with id ' + id);
    }

    return {
        resolveCheck: resolveCheck,
        rejectCheck: rejectCheck,
        waitForCheck: waitForCheck,
        test: {
            registerCheck: registerCheck   
        }
    };
});
