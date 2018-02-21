// @flow

import { noop } from 'lib/noop';
import { tests as clientSideTests } from 'common/modules/experiments/ab-tests';
import { variantFor } from 'common/modules/experiments/segment-util';
import config from 'lib/config';
import reportError from 'lib/report-error';
import ophan from 'ophan/ng';

const submit = (payload: OphanABPayload): void =>
    ophan.record({
        abTestRegister: payload,
    });

/**
 * generate an A/B event for ophan
 */
const makeABEvent = (
    variant: Variant,
    complete: string | boolean
): OphanABEvent => {
    const event: OphanABEvent = {
        variantName: variant.id,
        complete,
    };

    if (variant.options && variant.options.campaignCodes) {
        event.campaignCodes = variant.options.campaignCodes;
    }

    return event;
};

/**
 * Checks if this test will defer its impression by providing its own impression function.
 *
 * If it does, the test won't be included in the Ophan call that happens at pageload, and must fire the impression
 * itself via the callback passed to the `impression` property in the variant.
 */
const defersImpression = (test: ABTest): boolean =>
    test.variants.every(variant => typeof variant.impression === 'function');

/**
 * Create a function that will fire an A/B test to Ophan
 */
const buildOphanSubmitter = (
    test: ABTest,
    variant: Variant,
    complete: boolean
): (() => void) => {
    const data = {};

    if (variant) data[test.id] = makeABEvent(variant, String(complete));

    return () => submit(data);
};

/**
 * Create a function that sets up listener to fire an Ophan `complete` event. This is used in the `success` and
 * `impression` properties of test variants to allow test authors to control when these events are sent out.
 *
 * @see {@link defersImpression}
 */
const registerCompleteEvent = (complete: boolean) => (test: ABTest): void => {
    const variant = variantFor(test);

    if (variant) {
        const listener =
            (complete ? variant.success : variant.impression) || noop;

        try {
            listener(buildOphanSubmitter(test, variant, complete));
        } catch (err) {
            reportError(err, {}, false);
        }
    }
};

export const registerCompleteEvents = (tests: $ReadOnlyArray<ABTest>): void =>
    tests.forEach(registerCompleteEvent(true));

export const registerImpressionEvents = (tests: $ReadOnlyArray<ABTest>): void =>
    tests.filter(defersImpression).forEach(registerCompleteEvent(false));

export const buildOphanPayload = (): OphanABPayload => {
    try {
        const log = {};
        const serverSideTests = Object.keys(config.tests).filter(
            test => !!config.tests[test]
        );

        clientSideTests
            .filter(!defersImpression)
            .map(test => ({test, variant: variantFor(test)}))
            .filter(t => !!t.variant)
            .forEach(({test, variant}) => {
                log[test.id] = makeABEvent(variant, 'false');
            });

        serverSideTests.forEach(test => {
            const serverSideVariant: Variant = {
                id: 'inTest',
                test: () => undefined,
            };

            log[`ab${test}`] = makeABEvent(serverSideVariant, 'false');
        });

        return log;
    } catch (error) {
        // Encountering an error should invalidate the logging process.
        reportError(error, {}, false);
        return {};
    }
};

export const trackABTests = () => submit(buildOphanPayload());
