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
            if (commercialFeatures.thirdPartyTags && commercialFeatures.highMerch) {
                return trackAdRender('dfp-ad--merchandising-high');
            } else {
                return false;
            }
        },
        hasLowPriorityAdLoaded: function() {
            // if thirdPartyTags false no external ads are loaded
            if (commercialFeatures.thirdPartyTags) {
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
