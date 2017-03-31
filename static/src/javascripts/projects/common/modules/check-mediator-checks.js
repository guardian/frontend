// @flow

/**
 * referenced as passCondition for dependentChecks
 * SOMECHECKSPASSED: At least one dependentCheck has returned true
 * EVERYCHECKPASSED: Every dependentCheck has returned true
**/
const { some: SOMECHECKSPASSED, every: EVERYCHECKPASSED } = Array.prototype;

/**
 * checkList is an array of object literals.
 * Each object in this array will be converted to a DefferedCheck and added to registeredChecks
 * Each object can contain these 3 fields:
    * id (required, string)
    * passCondition (optional, SOMECHECKSPASSED/EVERYCHECKPASSED)
    * dependentChecks (optional, nested array of checks)
 * If object has dependentChecks then the DefferedCheck will resolve when these dependentChecks have all resolved
 *
**/
const checks = [
    {
        id: 'isOutbrainBlockedByAds',
        passCondition: EVERYCHECKPASSED,
        dependentChecks: [
            {
                id: 'hasHighPriorityAdLoaded',
            },
            {
                id: 'hasLowPriorityAdLoaded',
            },
        ],
    },
    {
        id: 'isOutbrainMerchandiseCompliant',
        passCondition: EVERYCHECKPASSED,
        dependentChecks: [
            {
                id: 'hasHighPriorityAdLoaded',
            },
            {
                id: 'hasLowPriorityAdNotLoaded',
            },
        ],
    },
    {
        id: 'isOutbrainMerchandiseCompliantOrBlockedByAds',
        passCondition: SOMECHECKSPASSED,
        dependentChecks: [
            {
                id: 'isOutbrainMerchandiseCompliant',
            },
            {
                id: 'isOutbrainBlockedByAds',
            },
        ],
    },
    {
        id: 'emailCanRun',
        passCondition: EVERYCHECKPASSED,
        dependentChecks: [
            {
                id: 'emailCanRunPreCheck',
            },
            {
                id: 'listCanRun',
            },
            {
                id: 'emailInArticleOutbrainEnabled',
            },
            {
                id: 'isUserNotInContributionsAbTest',
            },
        ],
    },
    {
        id: 'isUserInEmailAbTestAndEmailCanRun',
        passCondition: EVERYCHECKPASSED,
        dependentChecks: [
            {
                id: 'isUserInEmailAbTest',
            },
            {
                id: 'emailCanRun',
            },
        ],
    },
    {
        id: 'isOutbrainNonCompliant',
        passCondition: SOMECHECKSPASSED,
        dependentChecks: [
            {
                id: 'isUserInContributionsAbTest',
            },
            {
                id: 'isUserInEmailAbTestAndEmailCanRun',
            },
            {
                id: 'isStoryQuestionsOnPage',
            },
        ],
    },
    {
        id: 'emailCanRunPostCheck',
        passCondition: SOMECHECKSPASSED,
        dependentChecks: [
            {
                id: 'isUserInEmailAbTest',
            },
            {
                id: 'isOutbrainMerchandiseCompliantOrBlockedByAds',
            },
            {
                id: 'isOutbrainDisabled',
            },
            {
                id: 'isStoryQuestionsOnPage',
            },
        ],
    },
];

export default checks;
