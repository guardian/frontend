import type { ABTest, Runnable, Variant } from '@guardian/ab-core';
import ophan from 'ophan/ng';
import config from '../../../../lib/config';
import { noop } from '../../../../lib/noop';
import reportError from '../../../../lib/report-error';

type BooleanFunction<Args extends unknown[]> = (...args: Args) => boolean;
const not =
	<Args extends unknown[]>(f: BooleanFunction<Args>): BooleanFunction<Args> =>
	(...args) =>
		!f(...args);

const submit = (payload: OphanABPayload): void =>
	void ophan.record({
		abTestRegister: payload,
	});

/**
 * generate an A/B event for ophan
 */
const makeABEvent = (
	variant: Variant,
	complete: string | boolean,
): OphanABEvent => {
	const event: OphanABEvent = {
		variantName: variant.id,
		complete,
	};

	if (variant.campaignCode) {
		event.campaignCodes = [variant.campaignCode];
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
	test.variants.every((variant) => typeof variant.impression === 'function');

/**
 * Create a function that will fire an A/B test to Ophan
 */
const buildOphanSubmitter = (
	test: ABTest,
	variant: Variant,
	complete: boolean,
): (() => void) => {
	const data = {
		[test.id]: makeABEvent(variant, String(complete)),
	};
	return () => submit(data);
};

/**
 * Create a function that sets up listener to fire an Ophan `complete` event. This is used in the `success` and
 * `impression` properties of test variants to allow test authors to control when these events are sent out.
 *
 * @see {@link defersImpression}
 */
const registerCompleteEvent =
	(complete: boolean) =>
	(test: Runnable): void => {
		const variant = test.variantToRun;
		const listener =
			(complete ? variant.success : variant.impression) ?? noop;

		try {
			listener(buildOphanSubmitter(test, variant, complete));
		} catch (err) {
			reportError(err, {}, false);
		}
	};

export const registerCompleteEvents = (tests: readonly Runnable[]): void =>
	tests.forEach(registerCompleteEvent(true));

export const registerImpressionEvents = (tests: readonly Runnable[]): void =>
	tests.filter(defersImpression).forEach(registerCompleteEvent(false));

export const buildOphanPayload = (
	tests: readonly Runnable[],
): OphanABPayload => {
	try {
		const log: OphanABPayload = {};
		const serverSideTests = Object.keys(config.get('tests', {})).filter(
			(test) => !!config.get(`tests.${test}`),
		);

		tests.filter(not(defersImpression)).forEach((test) => {
			log[test.id] = makeABEvent(test.variantToRun, 'false');
		});

		serverSideTests.forEach((test) => {
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
export const trackABTests = (tests: readonly Runnable[]): void =>
	submit(buildOphanPayload(tests));
export { buildOphanSubmitter };
