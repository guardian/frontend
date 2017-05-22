define([
    'lodash/collections/find',
    'lib/config',
    'common/modules/check-mediator',
    'common/modules/check-mediator-checks',
    'common/modules/email/run-checks',
    'common/modules/email/email-article',
    'common/modules/experiments/ab-test-clash',
    'commercial/modules/dfp/track-ad-render',
    'commercial/modules/commercial-features'
], function(
    find,
    config,
    checkMediator,
    checkMediatorChecks,
    emailRunChecks,
    emailArticle,
    clash,
    trackAdRender,
    commercialFeatures
) {

    var someCheckPassed = function(results) {
        return results.includes(true);
    };

    var everyCheckPassed = function(results) {
        return !results.includes(false);
    };

    var checksToDispatch = {
        isOutbrainDisabled: function () {
            return !commercialFeatures.commercialFeatures.outbrain;
        },

        isUserInContributionsAbTest: function() {
            return clash.userIsInAClashingAbTest(clash.contributionsTests);
        },

        isUserNotInContributionsAbTest: function() {
            return checkMediator.waitForCheck('isUserInContributionsAbTest').then(function (userInContributionsAbTest) {
                return !userInContributionsAbTest;
            });
        },

        isUserInEmailAbTest: function() {
            return clash.userIsInAClashingAbTest(clash.emailTests);
        },

        emailCanRunPreCheck: function() {
            return emailRunChecks.allEmailCanRun();
        },

        listCanRun: function() {
            return !!find(emailArticle.getListConfigs(), emailRunChecks.listCanRun);
        },

        emailInArticleOutbrainEnabled: function() {
            return config.switches.emailInArticleOutbrain;
        },

        hasHighPriorityAdLoaded: function() {
            // if thirdPartyTags false no external ads are loaded
            if (commercialFeatures.commercialFeatures.thirdPartyTags && commercialFeatures.commercialFeatures.highMerch) {
                return trackAdRender('dfp-ad--merchandising-high');
            } else {
                return false;
            }
        },

        hasLowPriorityAdLoaded: function() {
            // if thirdPartyTags false no external ads are loaded
            if (commercialFeatures.commercialFeatures.thirdPartyTags) {
                return checkMediator.waitForCheck('hasHighPriorityAdLoaded').then(function (highPriorityAdLoaded) {
                    if (highPriorityAdLoaded) {
                        return trackAdRender('dfp-ad--merchandising');
                    } else {
                        return true;
                    }
                });
            } else {
                return false;
            }
        },

        hasLowPriorityAdNotLoaded: function() {
            return checkMediator.waitForCheck('hasLowPriorityAdLoaded').then(function (lowPriorityAdLoaded) {
                return !lowPriorityAdLoaded;
            });
        },

        isStoryQuestionsOnPage: function() {
            return document.querySelectorAll('.js-ask-question-link').length > 0;
        },

        isOutbrainBlockedByAds: function() {
            var dependentChecks = [
                checkMediator.waitForCheck('hasHighPriorityAdLoaded'),
                checkMediator.waitForCheck('hasLowPriorityAdLoaded')
            ];

            return Promise.all(dependentChecks).then(function (results) {
                return everyCheckPassed(results);
            });
        },

        isOutbrainMerchandiseCompliant: function() {
            var dependentChecks = [
                checkMediator.waitForCheck('hasHighPriorityAdLoaded'),
                checkMediator.waitForCheck('hasLowPriorityAdNotLoaded')
            ];

            return Promise.all(dependentChecks).then(function (results) {
                return everyCheckPassed(results);
            });
        },

        isOutbrainMerchandiseCompliantOrBlockedByAds: function() {
            var dependentChecks = [
                checkMediator.waitForCheck('isOutbrainMerchandiseCompliant'),
                checkMediator.waitForCheck('isOutbrainBlockedByAds')
            ];

            return Promise.all(dependentChecks).then(function (results) {
                return someCheckPassed(results); 
            });
        },

        emailCanRun: function() {
            var dependentChecks = [
                checkMediator.waitForCheck('emailCanRunPreCheck'),
                checkMediator.waitForCheck('listCanRun'),
                checkMediator.waitForCheck('emailInArticleOutbrainEnabled'),
                checkMediator.waitForCheck('isUserNotInContributionsAbTest')
            ];
            
            return Promise.all(dependentChecks).then(function (results) {
                return everyCheckPassed(results); 
            });      
        },

        isUserInEmailAbTestAndEmailCanRun: function() {
            var dependentChecks = [
                checkMediator.waitForCheck('isUserInEmailAbTest'),
                checkMediator.waitForCheck('emailCanRun')
            ];

            return Promise.all(dependentChecks).then(function (results) {
                return everyCheckPassed(results);
            });
        },

        isOutbrainNonCompliant: function() {
            var dependentChecks = [
                checkMediator.waitForCheck('isUserInContributionsAbTest'),
                checkMediator.waitForCheck('isUserInEmailAbTestAndEmailCanRun'),
                checkMediator.waitForCheck('isStoryQuestionsOnPage')
            ];

            return Promise.all(dependentChecks).then(function (results) {
                return someCheckPassed(results); 
            });
        },

        emailCanRunPostCheck: function() {
            var dependentChecks = [
                checkMediator.waitForCheck('isUserInEmailAbTest'),
                checkMediator.waitForCheck('isOutbrainMerchandiseCompliantOrBlockedByAds'),
                checkMediator.waitForCheck('isOutbrainDisabled'),
                checkMediator.waitForCheck('isStoryQuestionsOnPage')
            ];
            
            return Promise.all(dependentChecks).then(function (results) {
                return someCheckPassed(results); 
            }); 
        }
    };

    function init() {
        Object.keys(checksToDispatch).forEach(function(key) {
            if (checkMediatorChecks.checks.indexOf(key)) {
                checkMediator.resolveCheck(key, checksToDispatch[key]());
            }
        });
    }

    return {
        init: init
    };
});
