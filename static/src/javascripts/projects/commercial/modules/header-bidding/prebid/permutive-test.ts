import config_ from '../../../../../lib/config';

// This is really a hacky workaround ⚠️
const config = config_ as {
	get: (s: string, d?: string) => string;
};

let isInTest: boolean | undefined;

const isInServerSideTest = (): boolean =>
	config.get('tests.prebidWithPermutiveVariant') === 'variant';

export const isInPrebidPermutiveTest = (): boolean => {
	if (isInTest === undefined) {
		isInTest = isInServerSideTest();
	}

	return isInTest;
};
