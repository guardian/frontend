define([
    'Promise',
    'common/utils/config'
    ], function (
    Promise,
    config
) {

    var registeredChecks = {};

    var checkList = [{
            id: 'isOutbrainNonCompliant',
            customCheckBuilder: function () {
                var isUserInAClashingAbTest = getCheck('isUserInAClashingAbTest');
                var isEmailInserted = getCheck('isEmailInserted');
                var dependentCheckPromises = [
                    isUserInAClashingAbTest.complete
                ];

                if (config.switches.emailInArticleOutbrain) {
                    dependentCheckPromises.push(isEmailInserted.complete);
                }

                return new DeferredCheck(dependentCheckPromises);
            },
            dependentChecks: [{
                id: 'isUserInAClashingAbTest',
                dependentChecks: []
            }, {
                id: 'isEmailInserted',
                dependentChecks: []
            }]
        }];

    function DeferredCheck(dependentCheckPromises) {
        if (dependentCheckPromises) {
            this.complete = Promise.all(dependentCheckPromises);
        } else {
            this.complete = new Promise(function(resolve, reject) {
                this.resolve = resolve;
                this.reject = reject;
            }.bind(this));
        }
    }

    function getCheck(id) {
        if (registeredChecks[id]) {
            return registeredChecks[id];
        }
    }

    function getDefferedCheck(check) {
        check.dependentChecks.forEach(registerCheck);

        if (check.customCheckBuilder) {
            return check.customCheckBuilder();
        }

        return new DeferredCheck();
    }

    function registerCheck(check) {
        registeredChecks[check.id] = getDefferedCheck(check);
    }

    function init() {
        checkList.forEach(registerCheck);
    }

    init();

    return {
        getCheck: getCheck
    }
});
