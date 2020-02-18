// @flow
import userPrefs from 'common/modules/user-prefs';
import { local } from 'lib/storage';
import config from 'lib/config';
import {
    getSynchronousTestsToRun,
    isInABTestSynchronous,
} from 'common/modules/experiments/ab';
import { isUserLoggedIn } from 'common/modules/identity/api';

// wrapper over isLoggedIn
export const isLoggedIn = isUserLoggedIn;

// wrapper over isInABTestSynchronous
export const isInTest: ABTest => boolean = test => isInABTestSynchronous(test);

// get the current variant id the user is in
export const getVariant: ABTest => string = test => {
    //  get the current test
    const currentTest = getSynchronousTestsToRun().find(t => t.id === test.id);

    // get variant user is in for the test
    return currentTest ? currentTest.variantToRun.id : '';
};

// check if the user has dismissed the gate by checking the user preferences
export const hasUserDismissedGate: ({
    componentId: string,
    componentName: string,
    variant: string,
}) => boolean = ({ componentId, componentName, variant }) => {
    const prefs = userPrefs.get(componentName) || {};

    return !!prefs[`${componentId}-${variant}`];
};

// set in user preferences that the user has dismissed the gate, set the value to the current ISO date string
export const setUserDismissedGate: ({
    name: string,
    variant: string,
    componentName: string,
}) => void = ({ name, variant, componentName }) => {
    const prefs = userPrefs.get(componentName) || {};
    prefs[`${name}-${variant}`] = new Date().toISOString();
    userPrefs.set(componentName, prefs);
};

// use the dailyArticleCount from the local storage to see how many articles the user has viewed in a day
// in our case if this is the n-numbered article or higher the user has viewed then set the gate
export const isNPageOrHigherPageView = (n: number = 2): boolean => {
    // get daily read article count array from local storage
    const dailyArticleCount = local.get('gu.history.dailyArticleCount') || [];

    // get the count from latest date, if it doesnt exist, set to 0
    const { count = 0 } = dailyArticleCount[0] || {};

    // check if count is greater or equal to 1 less than n since dailyArticleCount is incremented after this component is loaded
    return count >= n - 1;
};

// hide the sign in gate on article types that are not supported
// add to the include parameter array if there are specific types that should be included/overridden
export const isInvalidArticleType = (include: Array<string> = []): boolean => {
    // uses guardian config object to check for these page types
    const invalidTypes = [
        'isColumn',
        'isFront',
        'isHosted',
        'isImmersive',
        'isLive',
        'isLiveBlog',
        'isNumberedList',
        'isPaidContent',
        'isPhotoEssay',
        'isSensitive',
        'isSplash',
    ];

    return invalidTypes
        .filter(el => !include.includes(el))
        .reduce((isArticleInvalid, type) => {
            if (isArticleInvalid) return true;

            return config.get(`page.${type}`);
        }, false);
};

// hide the sign in gate on certain sections of the site, e.g info, about, help etc.
// add to the include parameter array if there are specific types that should be included/overridden
export const isInvalidSection = (include: Array<string> = []): boolean => {
    const invalidSections = ['about', 'info', 'membership', 'help'];

    return invalidSections
        .filter(el => !include.includes(el))
        .reduce((isSectionInvalid, section) => {
            if (isSectionInvalid) return true;

            return config.get(`page.section`) === section;
        }, false);
};
