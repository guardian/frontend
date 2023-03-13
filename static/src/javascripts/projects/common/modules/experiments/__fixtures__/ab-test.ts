import type { ABTest, Runnable, Variant } from '@guardian/ab-core';

export const genVariant = (id: string, canRun?: boolean): Variant => ({
	id,
	test: () => undefined,
	...(canRun != null
		? {
				canRun: () => !!canRun,
		  }
		: {}),
});

export const genAbTest = (
	id: string,
	canRun?: boolean,
	expiry?: string,
	variants?: Variant[],
): ABTest => ({
	id,
	audienceCriteria: 'n/a',
	audienceOffset: 0,
	audience: 1,
	author: 'n/a',
	showForSensitive: false,
	canRun: () => {
		if (canRun != null) return !!canRun;
		return true;
	},
	description: 'n/a',
	start: '0001-01-01',
	expiry: expiry ?? '9999-12-12',
	successMeasure: 'n/a',
	variants: variants ?? [genVariant('control'), genVariant('variant')],
});

export const genRunnableAbTestWhereControlIsRunnable = (
	id: string,
	canRun?: boolean,
): Runnable<ABTest> => {
	const abTest = genAbTest(id, canRun);
	return { ...abTest, variantToRun: abTest.variants[0] };
};

export const genRunnableAbTestWhereVariantIsRunnable = (
	id: string,
	canRun?: boolean,
): Runnable<ABTest> => {
	const abTest = genAbTest(id, canRun);
	return { ...abTest, variantToRun: abTest.variants[1] };
};
