// @flow
import config from 'lib/config';
import { allEmailCanRun, listCanRun } from 'common/modules/email/run-checks';
import { getListConfigs } from 'common/modules/email/email-article';
import { trackAdRender } from 'commercial/modules/dfp/track-ad-render';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { checks } from 'common/modules/check-mediator-checks';
import { resolveCheck, waitForCheck } from 'common/modules/check-mediator';
import { getEpicTestToRun } from 'common/modules/experiments/ab';
import reportError from 'lib/report-error';

const someCheckPassed = (results): boolean => results.includes(true);

const everyCheckPassed = (results): boolean => !results.includes(false);

/**
    Any check added to checksToDispatch should also
    be added to the array of checks in './check-mediator-checks'.
* */
const checksToDispatch = {
    isOutbrainDisabled(): Promise<boolean> {
        if (commercialFeatures.outbrain) {
            return Promise.resolve(false);
        }

        return Promise.resolve(true);
    },

    isUserInContributionsAbTest(): Promise<boolean> {
        return getEpicTestToRun().then(Boolean);
    },

    isUserNotInContributionsAbTest(): Promise<boolean> {
        return waitForCheck('isUserInContributionsAbTest')
            .then(userInContributionsAbTest => !userInContributionsAbTest)
            .catch(error => {
                reportError(error, [], false);
                return Promise.resolve(false);
            });
    },

    emailCanRunPreCheck(): Promise<boolean> {
        return Promise.resolve(allEmailCanRun());
    },

    listCanRun(): Promise<boolean> {
        const listConfigs = getListConfigs();
        const canRun = !!Object.keys(listConfigs).find(key =>
            listCanRun(listConfigs[key])
        );

        return Promise.resolve(canRun);
    },

    emailInArticleOutbrainEnabled(): Promise<boolean> {
        return Promise.resolve(config.get('switches.emailInArticleOutbrain'));
    },

    hasHighPriorityAdLoaded(): Promise<boolean> {
        // if thirdPartyTags false no external ads are loaded
        // is irrelevant for ad-free users (independently of thirdPartyTags)
        if (
            commercialFeatures.thirdPartyTags &&
            commercialFeatures.highMerch &&
            !commercialFeatures.adFree
        ) {
            return Promise.resolve(trackAdRender('dfp-ad--merchandising-high'));
        }
        return Promise.resolve(false);
    },

    hasLowPriorityAdLoaded(): Promise<boolean> {
        // if thirdPartyTags false no external ads are loaded
        // is irrelevant for ad-free users (independently of thirdPartyTags)
        if (commercialFeatures.thirdPartyTags && !commercialFeatures.adFree) {
            return waitForCheck('hasHighPriorityAdLoaded')
                .then(highPriorityAdLoaded => {
                    if (highPriorityAdLoaded) {
                        return Promise.resolve(
                            trackAdRender('dfp-ad--merchandising')
                        );
                    }
                    return Promise.resolve(true);
                })
                .catch(error => {
                    reportError(error, [], false);
                    return Promise.resolve(false);
                });
        }
        return Promise.resolve(false);
    },

    hasLowPriorityAdNotLoaded(): Promise<boolean> {
        return waitForCheck('hasLowPriorityAdLoaded')
            .then(lowPriorityAdLoaded => !lowPriorityAdLoaded)
            .catch(error => {
                reportError(error, [], false);
                return Promise.resolve(true);
            });
    },

    isStoryQuestionsOnPage(): Promise<boolean> {
        return Promise.resolve(
            document.querySelectorAll('.js-ask-question-link').length > 0
        );
    },

    isOutbrainBlockedByAds(): Promise<boolean> {
        const dependentChecks = [
            waitForCheck('hasHighPriorityAdLoaded').catch(error => {
                reportError(error, [], false);
                return Promise.resolve(false);
            }),
            waitForCheck('hasLowPriorityAdLoaded').catch(error => {
                reportError(error, [], false);
                return Promise.resolve(false);
            }),
        ];

        return Promise.all(dependentChecks).then(results =>
            everyCheckPassed(results)
        );
    },

    isOutbrainMerchandiseCompliant(): Promise<boolean> {
        const dependentChecks = [
            waitForCheck('hasHighPriorityAdLoaded').catch(error => {
                reportError(error, [], false);
                return Promise.resolve(false);
            }),
            waitForCheck('hasLowPriorityAdNotLoaded').catch(error => {
                reportError(error, [], false);
                return Promise.resolve(false);
            }),
        ];

        return Promise.all(dependentChecks).then(results =>
            everyCheckPassed(results)
        );
    },

    isOutbrainMerchandiseCompliantOrBlockedByAds(): Promise<boolean> {
        const dependentChecks = [
            waitForCheck('isOutbrainMerchandiseCompliant').catch(error => {
                reportError(error, [], false);
                return Promise.resolve(false);
            }),
            waitForCheck('isOutbrainBlockedByAds').catch(error => {
                reportError(error, [], false);
                return Promise.resolve(false);
            }),
        ];

        return Promise.all(dependentChecks).then(results =>
            someCheckPassed(results)
        );
    },

    emailCanRun(): Promise<boolean> {
        const dependentChecks = [
            waitForCheck('emailCanRunPreCheck').catch(error => {
                reportError(error, [], false);
                return Promise.resolve(false);
            }),
            waitForCheck('listCanRun').catch(error => {
                reportError(error, [], false);
                return Promise.resolve(false);
            }),
            waitForCheck('emailInArticleOutbrainEnabled').catch(error => {
                reportError(error, [], false);
                return Promise.resolve(false);
            }),
            waitForCheck('isUserNotInContributionsAbTest').catch(error => {
                reportError(error, [], false);
                return Promise.resolve(false);
            }),
        ];

        return Promise.all(dependentChecks).then(results =>
            everyCheckPassed(results)
        );
    },

    emailCanRunPostCheck(): Promise<boolean> {
        const dependentChecks = [
            waitForCheck('isUserInEmailAbTest').catch(error => {
                reportError(error, [], false);
                return Promise.resolve(false);
            }),
            waitForCheck('isOutbrainMerchandiseCompliantOrBlockedByAds').catch(
                error => {
                    reportError(error, [], false);
                    return Promise.resolve(false);
                }
            ),
            waitForCheck('isOutbrainDisabled').catch(error => {
                reportError(error, [], false);
                return Promise.resolve(false);
            }),
            waitForCheck('isStoryQuestionsOnPage').catch(error => {
                reportError(error, [], false);
                return Promise.resolve(false);
            }),
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
