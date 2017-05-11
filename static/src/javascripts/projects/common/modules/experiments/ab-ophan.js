// @flow

import type {
    ABTest,
    OphanABEvent,
    OphanABPayload,
} from 'common/modules/experiments/ab-types';

import { getActiveTests } from 'common/modules/experiments/ab-tests';
import * as testCanRunChecks
    from 'common/modules/experiments/test-can-run-checks';
import segmentUtil from 'common/modules/experiments/segment-util';
import abUtils from 'common/modules/experiments/utils';
import config from 'lib/config';
import reportError from 'lib/report-error';
import ophan from 'ophan/ng';

const not = (f: any => boolean) => (...args) => !f.apply(this, args);
const noop = (): null => null;

const submit = (payload: OphanABPayload): void =>
    ophan.record({
        abTestRegister: payload,
    });

/**
 * generate an A/B event for ophan
 */
export const makeABEvent = (
    variantName: string,
    complete: string | boolean,
    campaignCodes?: Array<string>
): OphanABEvent => ({
    variantName,
    complete,
    campaignCodes,
});

/**
 * Create a function that will fire an A/B test to Ophan
 *
 * @param test
 * @param {string} variantId
 * @param {boolean} complete
 * @returns {Function} to fire the event
 */
export const buildOphanSubmitter = (
    test: ABTest,
    variantId: string,
    complete: boolean
): (() => void) => {
    const data = {};
    const variant = abUtils.getVariant(test, variantId);

    data[test.id] = makeABEvent(
        variantId,
        String(complete),
        variant.campaignCodes
    );

    return () => submit(data);
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
            listener(buildOphanSubmitter(test, variantId, complete));
        } catch (err) {
            reportError(err, {}, false);
        }
    }
};

/**
 * Checks if this test will defer its impression by providing its own impression function.
 *
 * If it does, the test won't be included in the Ophan call that happens at pageload, and must fire the impression
 * itself via the callback passed to the `impression` property in the variant.
 *
 * @param test
 * @returns {boolean}
 */
const defersImpression = (test: ABTest): boolean =>
    test.variants.every(variant => typeof variant.impression === 'function');

export const registerCompleteEvents = (): void =>
    getActiveTests().forEach(registerCompleteEvent(true));

export const registerImpressionEvents = (): void =>
    getActiveTests()
        .filter(defersImpression)
        .forEach(registerCompleteEvent(false));

export const buildOphanPayload = (): OphanABPayload => {
    try {
        const log = {};
        const serverSideTests = Object.keys(config.tests).filter(
            test => !!config.tests[test]
        );

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
                    log[test.id] = makeABEvent(
                        variantId,
                        'false',
                        campaingCodes
                    );
                }
            });

        serverSideTests.forEach(test => {
            log[`ab${test}`] = makeABEvent('inTest', 'false');
        });

        return log;
    } catch (error) {
        // Encountering an error should invalidate the logging process.
        reportError(error, {}, false);
        return {};
    }
};

export const trackABTests = () => submit(buildOphanPayload());
