define([
    'Promise',
    'common/utils/config'
    ], function (
    Promise,
    config
) {
    var isUserInAClashingAbTest = new DeferredCheck();

    var isEmailInserted = new DeferredCheck();
    
    var isOutbrainNonCompliant = function () {
        var checkList = [];

        if (config.switches.emailInArticleOutbrain) {
            checkList.push(isEmailInserted.complete);
        } 

        checkList.push(isUserInAClashingAbTest.complete);

        return new DeferredCheck(checkList);
    };

    function DeferredCheck(checkList) {
        if (checkList) {
            this.complete = Promise.all(checkList);
        } else {
            this.complete = new Promise(function(resolve, reject) {
                this.resolve = resolve;
                this.reject = reject;
            }.bind(this));
        }
    }

    return {
        isOutbrainNonCompliant: isOutbrainNonCompliant(),
        isUserInAClashingAbTest: isUserInAClashingAbTest,
        isEmailInserted: isEmailInserted
    };
});
