import type {
	ABTest,
	Participations,
	Runnable,
	Variant,
} from '@guardian/ab-core';
import { fromPairs, toPairs } from 'lodash-es';
import config from '../../../../lib/config';
import { NOT_IN_TEST, notInTestVariant } from './ab-constants';

export const testSwitchExists = (testId: string): boolean =>
	config.get<boolean | string>(`switches.ab${testId}`, 'NOT_FOUND') !==
	'NOT_FOUND';

export const isTestSwitchedOn = (testId: string): boolean =>
	config.get<boolean>(`switches.ab${testId}`, false);

export const runnableTestsToParticipations = (
	runnableTests: readonly Runnable[],
): Participations =>
	runnableTests.reduce(
		(participations: Participations, { id: testId, variantToRun }) => ({
			...participations,
			...{
				[testId]: {
					variant: variantToRun.id,
				},
			},
		}),
		{},
	);

export const testExclusionsWhoseSwitchExists = (
	participations: Participations,
): Participations => {
	const pairs: Array<
		[
			string,
			{
				variant: string;
			},
		]
	> = toPairs(participations).filter(
		([testId, { variant: variantId }]) =>
			variantId === NOT_IN_TEST && testSwitchExists(testId),
	);
	return fromPairs(pairs);
};

// If the given test has a 'notintest' participation, return the notintest variant.
// Or else, if the given test has a normal variant participation, return that variant.qq
export const testAndParticipationsToVariant = (
	test: ABTest,
	participations: Participations,
): Variant | null | undefined => {
	// TODO: enable noUncheckedIndexedAccess in tsconfig
	const participation = participations[test.id] as
		| { variant: string }
		| undefined;

	if (participation) {
		// We need to return something concrete here to ensure
		// that a notintest variant actually prevents other variants running.
		if (participation.variant === NOT_IN_TEST) {
			return notInTestVariant;
		}

		return test.variants.find(
			(variant) => variant.id === participation.variant,
		);
	}

	return null;
};
