define([
    'lodash/collections/find',
    'lib/config',
    'lib/check-mediator',
    'common/modules/email/run-checks',
    'common/modules/email/email-article',
    'common/modules/experiments/ab-test-clash'
], function(
    find,
    config,
    checkMediator,
    emailRunChecks,
    emailArticle,
    clash
) {

    var checksToDispatch = {
        isUserInAClashingAbTest: function() {
            return clash.userIsInAClashingAbTest();
        },
        emailCanRun: function() {
            return emailRunChecks.allEmailCanRun();
        },
        listCanRun: function() {
            return !!find(emailArticle.getListConfigs(), emailRunChecks.listCanRun);
        },
        emailInArticleOutbrainEnabled: function() {
            return config.switches.emailInArticleOutbrain;
        }
    };

    function init() {
        Object.keys(checksToDispatch).forEach(function(key) {
            checkMediator.resolveCheck(key, checksToDispatch[key]());
        });
    }

    return {
        init: init
    };
});
