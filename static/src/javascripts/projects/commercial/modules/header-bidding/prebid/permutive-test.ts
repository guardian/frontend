import config_ from '../../../../../lib/config';

// This is really a hacky workaround ⚠️
const config = config_ as {
	get: (s: string, d?: string) => string;
};

export const isInPrebidPermutiveTest = (): boolean =>
	config.get('tests.prebidWithPermutiveVariant', '') === 'variant';
