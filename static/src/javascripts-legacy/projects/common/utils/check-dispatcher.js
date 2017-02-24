define([
    'common/utils/config',
    'common/utils/check-mediator',
    'common/modules/email/run-checks',
    'common/modules/email/email-article',
    'common/modules/experiments/ab-test-clash'
    ], function (
    config,
    checkMediator,
    emailRunChecks,
    emailArticle,
    clash
) {

    var checksToDispatch = {
    	isUserInAClashingAbTest: function () {
    		return clash.userIsInAClashingAbTest();
    	},
    	emailCanRun: function () {
    		return emailRunChecks.allEmailCanRun();
    	},
    	listCanRun: function () {
    		return find(emailArticle.getListConfigs(), emailRunChecks.listCanRun) ? true : false;
    	},
    	emailInArticleOutbrainEnabled: function () {
    		return config.switches.emailInArticleOutbrain;
    	}
    };

    function init() {
		Object.keys(checksToDispatch).forEach(function (key) {
			checkMediator.resolveCheck(key, checksToDispatch[key]());	
		});
    }

    return {
    	init: init
    };
});
