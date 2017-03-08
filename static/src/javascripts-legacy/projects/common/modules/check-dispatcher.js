define([
    'lodash/collections/find',
    'lib/config',
    'common/modules/check-mediator',
    'common/modules/email/run-checks',
    'common/modules/email/email-article',
    'common/modules/experiments/ab-test-clash',
    'commercial/modules/dfp/track-ad-render',
], function(
    find,
    config,
    checkMediator,
    emailRunChecks,
    emailArticle,
    clash,
    trackAdRender
) {

    var isUserInContributionsAbTest = false;

    var checksToDispatch = {
        isUserInContributionsAbTest: function() {
            return isUserInContributionsAbTest;
            // return clash.userIsInAClashingAbTest(clash.contributionsTests);
        },
        isUserNotInContributionsAbTest: function() {
            return !isUserInContributionsAbTest;
            // return !clash.userIsInAClashingAbTest(clash.contributionsTests);
        },
        isUserInEmailAbTest: function() {
            return false;
            // return clash.userIsInAClashingAbTest(clash.emailTests);
        },
        emailCanRunPreCheck: function() {
            return true;
            // return emailRunChecks.allEmailCanRun();
        },
        listCanRun: function() {
            return true;
            // return !!find(emailArticle.getListConfigs(), emailRunChecks.listCanRun);
        },
        emailInArticleOutbrainEnabled: function() {
            return true;
            // return config.switches.emailInArticleOutbrain;
        },
        isHighResAdLoaded: function() {
            return true;
            // return trackAdRender('dfp-ad--merchandising-high').then(function(isHighResAdLoaded) {
            //     return isHighResAdLoaded;
            // });
        },
        isLowResAdLoaded: function() {
            return true;
            // return trackAdRender('dfp-ad--merchandising').then(function(isLowResAdLoaded) {
            //     console.log('isLowResAdLoaded ---->', isLowResAdLoaded);
            //     return isLowResAdLoaded;
            // });
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
