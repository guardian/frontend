// @flow
import config from 'lib/config';
import { allEmailCanRun, listCanRun } from 'common/modules/email/run-checks';
import emailArticle from 'common/modules/email/email-article';
import clash from 'common/modules/experiments/ab-test-clash';
import trackAdRender from 'commercial/modules/dfp/track-ad-render';
import commercialFeatures from 'commercial/modules/commercial-features';
import { checks } from './check-mediator-checks';
import { resolveCheck, waitForCheck } from './check-mediator';

const someCheckPassed = results => results.includes(true);

const everyCheckPassed = results => !results.includes(false);

/**
    Any check added to checksToDispatch should also 
    be added to the array of checks in './check-mediator-checks'. 
**/
const checksToDispatch = {
    isOutbrainDisabled() {
        return !commercialFeatures.outbrain;
    },

    isUserInContributionsAbTest() {
        return clash.userIsInAClashingAbTest(clash.contributionsTests);
    },

    isUserNotInContributionsAbTest() {
        return waitForCheck('isUserInContributionsAbTest').then(
            userInContributionsAbTest => !userInContributionsAbTest
        );
    },

    isUserInEmailAbTest() {
        return clash.userIsInAClashingAbTest(clash.emailTests);
    },

    emailCanRunPreCheck() {
        return allEmailCanRun();
    },

    listCanRun() {
        const listConfigs = emailArticle.getListConfigs();

        return !!Object.keys(listConfigs).find(key =>
            listCanRun(listConfigs[key])
        );
    },

    emailInArticleOutbrainEnabled() {
        return config.switches.emailInArticleOutbrain;
    },

    hasHighPriorityAdLoaded() {
        // if thirdPartyTags false no external ads are loaded
        if (commercialFeatures.thirdPartyTags && commercialFeatures.highMerch) {
            return trackAdRender('dfp-ad--merchandising-high');
        }
        return false;
    },

    hasLowPriorityAdLoaded() {
        // if thirdPartyTags false no external ads are loaded
        if (commercialFeatures.thirdPartyTags) {
            return waitForCheck(
                'hasHighPriorityAdLoaded'
            ).then(highPriorityAdLoaded => {
                if (highPriorityAdLoaded) {
                    return trackAdRender('dfp-ad--merchandising');
                }
                return true;
            });
        }
        return false;
    },

    hasLowPriorityAdNotLoaded() {
        return waitForCheck('hasLowPriorityAdLoaded').then(
            lowPriorityAdLoaded => !lowPriorityAdLoaded
        );
    },

    isStoryQuestionsOnPage() {
        return document.querySelectorAll('.js-ask-question-link').length > 0;
    },

    isOutbrainBlockedByAds() {
        const dependentChecks = [
            waitForCheck('hasHighPriorityAdLoaded'),
            waitForCheck('hasLowPriorityAdLoaded'),
        ];

        return Promise.all(dependentChecks).then(results =>
            everyCheckPassed(results)
        );
    },

    isOutbrainMerchandiseCompliant() {
        const dependentChecks = [
            waitForCheck('hasHighPriorityAdLoaded'),
            waitForCheck('hasLowPriorityAdNotLoaded'),
        ];

        return Promise.all(dependentChecks).then(results =>
            everyCheckPassed(results)
        );
    },

    isOutbrainMerchandiseCompliantOrBlockedByAds() {
        const dependentChecks = [
            waitForCheck('isOutbrainMerchandiseCompliant'),
            waitForCheck('isOutbrainBlockedByAds'),
        ];

        return Promise.all(dependentChecks).then(results =>
            someCheckPassed(results)
        );
    },

    emailCanRun() {
        const dependentChecks = [
            waitForCheck('emailCanRunPreCheck'),
            waitForCheck('listCanRun'),
            waitForCheck('emailInArticleOutbrainEnabled'),
            waitForCheck('isUserNotInContributionsAbTest'),
        ];

        return Promise.all(dependentChecks).then(results =>
            everyCheckPassed(results)
        );
    },

    isUserInEmailAbTestAndEmailCanRun() {
        const dependentChecks = [
            waitForCheck('isUserInEmailAbTest'),
            waitForCheck('emailCanRun'),
        ];

        return Promise.all(dependentChecks).then(results =>
            everyCheckPassed(results)
        );
    },

    emailCanRunPostCheck() {
        const dependentChecks = [
            waitForCheck('isUserInEmailAbTest'),
            waitForCheck('isOutbrainMerchandiseCompliantOrBlockedByAds'),
            waitForCheck('isOutbrainDisabled'),
            waitForCheck('isStoryQuestionsOnPage'),
        ];

        return Promise.all(dependentChecks).then(results =>
            someCheckPassed(results)
        );
    },
};

const initCheckDispatcher = (): void => {
    Object.keys(checksToDispatch).forEach(key => {
        if (checks.includes(key)) {
            resolveCheck(key, checksToDispatch[key]());
        }
    });
};

export { initCheckDispatcher };
