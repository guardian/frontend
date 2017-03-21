define([
    'lodash/collections/find',
    'lib/config',
    'common/modules/check-mediator',
    'common/modules/email/run-checks',
    'common/modules/email/email-article',
    'common/modules/experiments/ab-test-clash',
    'commercial/modules/dfp/track-ad-render',
    'commercial/modules/commercial-features'
], function(
    find,
    config,
    checkMediator,
    emailRunChecks,
    emailArticle,
    clash,
    trackAdRender,
    commercialFeatures
) {

    var checksToDispatch = {
        isOutbrainDisabled: function () {
            return !commercialFeatures.outbrain;
        },
        thirdPartyTagsDisabled: function () {
            return !commercialFeatures.thirdPartyTags;
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
            return checkMediator.waitForCheck('thirdPartyTagsDisabled').then(function (thirdPartyTagsDisabled) {
                // if thirdPartyTagsDisabled no external ads are loaded
                if (thirdPartyTagsDisabled) {
                    return false;
                } else {
                    return trackAdRender('dfp-ad--merchandising-high').then(function(highPriorityAdLoaded) {
                        return highPriorityAdLoaded;
                    });
                }
            });
        },
        hasLowPriorityAdLoaded: function() {
            return checkMediator.waitForCheck('thirdPartyTagsDisabled').then(function (thirdPartyTagsDisabled) {
                // if thirdPartyTagsDisabled no external ads are loaded
                if (thirdPartyTagsDisabled) {
                    return false;
                } else {
                    return checkMediator.waitForCheck('hasHighPriorityAdLoaded').then(function (highPriorityAdLoaded) {
                        if (highPriorityAdLoaded) {
                            return trackAdRender('dfp-ad--merchandising').then(function(lowPriorityAdLoaded) {
                                return lowPriorityAdLoaded;
                            });
                        } else {          
                            return true;
                        }
                    });     
                }
            });
        },
        hasLowPriorityAdNotLoaded: function() {
            return checkMediator.waitForCheck('hasLowPriorityAdLoaded').then(function (lowPriorityAdLoaded) {
                return !lowPriorityAdLoaded;
            });
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
