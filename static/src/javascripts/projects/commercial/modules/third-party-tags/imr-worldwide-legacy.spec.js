import { imrWorldwideLegacy } from './imr-worldwide-legacy';

const { shouldRun, url, onLoad } = imrWorldwideLegacy;

jest.mock('../../../common/modules/commercial/geo-utils', () => ({
	isInAuOrNz: jest.fn().mockReturnValue(true),
}));

jest.mock('../../../common/modules/experiments/ab', () => ({
	isInVariantSynchronous: jest.fn(),
}));

/**
 * we have to mock config like this because
 * loading imr-worldwide-legacy has side affects
 * that are dependent on config.
 * */
jest.mock('../../../../lib/config', () => {
	const defaultConfig = {
		switches: {
			imrWorldwide: true,
		},
	};

	return Object.assign({}, defaultConfig, {
		get: (path = '', defaultValue) =>
			path
				.replace(/\[(.+?)]/g, '.$1')
				.split('.')
				.reduce((o, key) => o[key], defaultConfig) || defaultValue,
	});
});

describe('third party tag IMR worldwide legacy', () => {
	it('should exist and have the correct exports', () => {
		expect(shouldRun).toBe(true);
		expect(onLoad).toBeDefined();
		expect(url).toBe('//secure-au.imrworldwide.com/v60.js');
	});
});
