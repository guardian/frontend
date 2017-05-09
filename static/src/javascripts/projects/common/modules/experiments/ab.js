// @flow
import { ABTest } from 'common/modules/experiments/ab-types';
import reportError from 'lib/report-error';
import config from 'lib/config';
import { local } from 'lib/storage';
import noop from 'lodash/utilities/noop';
import abUtils from 'common/modules/experiments/utils';
import segmentUtil from 'common/modules/experiments/segment-util';
import testCanRunChecks from 'common/modules/experiments/test-can-run-checks';
import acquisitionTestSelector
    from 'common/modules/experiments/acquisition-test-selector';
import OpinionEmailVariants
    from 'common/modules/experiments/tests/opinion-email-variants';
import MembershipEngagementBannerTests
    from 'common/modules/experiments/tests/membership-engagement-banner-tests';
import PaidContentVsOutbrain2
    from 'common/modules/experiments/tests/paid-content-vs-outbrain';
import { tailorSurvey } from 'common/modules/experiments/tests/tailor-survey';
import TheLongReadEmailVariants
    from 'common/modules/experiments/tests/the-long-read-email-variants';
import FashionStatementEmailVariants
    from 'common/modules/experiments/tests/fashion-statement-email-variants';
import BookmarksEmailVariants2
    from 'common/modules/experiments/tests/bookmarks-email-variants-2';
import FilmTodayEmailVariants
    from 'common/modules/experiments/tests/film-today-email-variants';
import SleevenotesNewEmailVariant
    from 'common/modules/experiments/tests/sleeve-notes-new-email-variant';
import SleevenotesLegacyEmailVariant
    from 'common/modules/experiments/tests/sleeve-notes-legacy-email-variant';
import IncreaseInlineAdsRedux
    from 'common/modules/experiments/tests/increase-inline-ads';
import ophan from 'ophan/ng';
import PaidCommenting from 'common/modules/experiments/tests/paid-commenting';
import BundleDigitalSubPriceTest1
    from 'common/modules/experiments/tests/bundle-digital-sub-price-test-1';

let TESTS = [
    new OpinionEmailVariants(),
    new PaidContentVsOutbrain2(),
    acquisitionTestSelector.getTest(),
    tailorSurvey,
    TheLongReadEmailVariants,
    FashionStatementEmailVariants,
    BookmarksEmailVariants2,
    FilmTodayEmailVariants,
    SleevenotesNewEmailVariant,
    SleevenotesLegacyEmailVariant,
    new IncreaseInlineAdsRedux(),
    new PaidCommenting(),
    new BundleDigitalSubPriceTest1(),
]
    .concat(MembershipEngagementBannerTests)
    .filter(t => t !== undefined && t !== null);

const not = f => (...args) => !f.apply(this, args);

// Removes any tests from localstorage that have been
// renamed/deleted from the backend
const cleanParticipations = () =>
    Object.keys(abUtils.getParticipations()).forEach(k => {
        if (typeof config.switches[`ab${k}`] === 'undefined') {
            abUtils.removeParticipation({
                id: k,
            });
        } else {
            const testExists = TESTS.some(element => element.id === k);

            if (!testExists) {
                abUtils.removeParticipation({
                    id: k,
                });
            }
        }
    });

export const getActiveTests = () =>
    TESTS.filter(test => {
        if (testCanRunChecks.isExpired(test.expiry)) {
            abUtils.removeParticipation(test);
            return false;
        }
        return true;
    });

export const getExpiredTests = () =>
    TESTS.filter(test => testCanRunChecks.isExpired(test.expiry));

export const getTest = (id: string): ?ABTest => {
    const testIds = TESTS.map(test => test.id);
    const index = testIds.indexOf(id);
    return index > -1 ? TESTS[index] : null;
};

const abData = (
    variantName: string,
    complete: string,
    campaignCodes?: Array<string>
) => {
    const data = {
        variantName,
        complete,
        campaignCodes,
    };

    return data;
};

// These kinds of tests are both server and client side.
const getServerSideTests = () =>
    Object.keys(config.tests).filter(test => !!config.tests[test]);

/**
 * Checks if this test will defer its impression by providing its own impression function.
 *
 * If it does, the test won't be included in the Ophan call that happens at pageload, and must fire the impression
 * itself via the callback passed to the `impression` property in the variant.
 *
 * @param test
 * @returns {boolean}
 */
const defersImpression = test =>
    test.variants.every(variant => typeof variant.impression === 'function');

export const getAbLoggableObject = () => {
    try {
        const log = {};

        getActiveTests()
            .filter(not(defersImpression))
            .filter(abUtils.isParticipating)
            .filter(testCanRunChecks.testCanBeRun)
            .forEach(test => {
                const variantId = abUtils.getTestVariantId(test.id);
                const variant = abUtils.getVariant(test, variantId);
                const campaingCodes = variant && variant.campaignCodes
                    ? variant.campaignCodes
                    : undefined;

                if (variantId && segmentUtil.isInTest(test)) {
                    log[test.id] = abData(variantId, 'false', campaingCodes);
                }
            });

        getServerSideTests().forEach(test => {
            log[`ab${test}`] = abData('inTest', 'false');
        });

        return log;
    } catch (error) {
        // Encountering an error should invalidate the logging process.
        reportError(error, {}, false);
        return {};
    }
};

const recordOphanAbEvent = data =>
    ophan.record({
        abTestRegister: data,
    });

export const trackEvent = () => recordOphanAbEvent(getAbLoggableObject());

/**
 * Register a test and variant's complete state with Ophan
 *
 * @param test
 * @param {string} variantId
 * @param {boolean} complete
 * @returns {Function} to fire the event
 */
const recordTestComplete = (
    test: ABTest,
    variantId: string,
    complete: boolean
) => {
    const data = {};
    const variant = abUtils.getVariant(test, variantId);

    data[test.id] = abData(variantId, String(complete), variant.campaignCodes);

    return () => recordOphanAbEvent(data);
};

// Finds variant in specific tests and runs it
const runTest = test => {
    if (abUtils.isParticipating(test) && testCanRunChecks.testCanBeRun(test)) {
        const participations = abUtils.getParticipations();
        const variantId = participations[test.id].variant;
        const variant = abUtils.getVariant(test, variantId);

        if (variant) {
            variant.test();
        } else if (!segmentUtil.isInTest(test) && test.notInTest) {
            test.notInTest();
        }
    }
};

const allocateUserToTest = test => {
    // Only allocate the user if the test is valid and they're not already participating.
    if (testCanRunChecks.testCanBeRun(test) && !abUtils.isParticipating(test)) {
        abUtils.addParticipation(test, segmentUtil.variantIdFor(test));
    }
};

/**
 * Create a function that sets up listener to fire an Ophan `complete` event. This is used in the `success` and
 * `impression` properties of test variants to allow test authors to control when these events are sent out.
 *
 * @see {@link defersImpression}
 * @param {Boolean} complete
 * @returns {Function}
 */
const registerCompleteEvent = complete => test => {
    const variantId = abUtils.getTestVariantId(test.id);

    if (variantId && variantId !== 'notintest') {
        const variant = abUtils.getVariant(test, variantId);
        const listener =
            (complete ? variant.success : variant.impression) || noop;

        try {
            listener(recordTestComplete(test, variantId, complete));
        } catch (err) {
            reportError(err, {}, false);
        }
    }
};

export const shouldRunTest = (id: string, variant: string) => {
    const test = getTest(id);

    return (
        test &&
        abUtils.isParticipating(test) &&
        abUtils.getTestVariantId(id) === variant &&
        testCanRunChecks.testCanBeRun(test)
    );
};

const getForcedIntoTests = () => {
    if (/^#ab/.test(window.location.hash)) {
        const tokens = window.location.hash.replace('#ab-', '').split(',');

        return tokens.map(token => {
            const abParam = token.split('=');

            return {
                id: abParam[0],
                variant: abParam[1],
            };
        });
    }

    return JSON.parse(local.get('gu.devtools.ab')) || [];
};

export const getTests = () => TESTS;
export const addTest = (test: ABTest) => TESTS.push(test);
export const clearTests = () => {
    TESTS = [];
};

export const segment = () =>
    getActiveTests().forEach(test => {
        allocateUserToTest(test);
    });

export const forceSegment = (testId: string, variant: string) => {
    getActiveTests().filter(test => test.id === testId).forEach(test => {
        abUtils.addParticipation(test, variant);
    });
};

export const forceVariantCompleteFunctions = (
    testId: string,
    variantId: string
) => {
    const test = getTest(testId);

    if (test) {
        const variant =
            test &&
            test.variants.filter(
                v => v.id.toLowerCase() === variantId.toLowerCase()
            )[0];
        const impression = (variant && variant.impression) || noop;
        const complete = (variant && variant.success) || noop;

        impression(recordTestComplete(test, variantId, false));
        complete(recordTestComplete(test, variantId, true));
    }
};

export const segmentUser = () => {
    const forcedIntoTests = getForcedIntoTests();

    if (forcedIntoTests.length) {
        forcedIntoTests.forEach(test => {
            forceSegment(test.id, test.variant);
            forceVariantCompleteFunctions(test.id, test.variant);
        });
    } else {
        segment();
    }

    cleanParticipations();
};

export const run = () => getActiveTests().forEach(runTest);

export const registerCompleteEvents = () =>
    getActiveTests().forEach(registerCompleteEvent(true));

export const registerImpressionEvents = () =>
    getActiveTests()
        .filter(defersImpression)
        .forEach(registerCompleteEvent(false));

/**
 * check if a test can be run (i.e. is not expired and switched on)
 */
export const testCanBeRun = (test: string | ABTest) => {
    if (typeof test === 'string') {
        const testObj = getTest(test);
        return testObj && testCanRunChecks.testCanBeRun(testObj);
    }

    return test.id && test.expiry && testCanRunChecks.testCanBeRun(test);
};

export const _ = {
    reset: () => {
        TESTS = [];
        segmentUtil.variantIdFor.cache = {};
    },
};
