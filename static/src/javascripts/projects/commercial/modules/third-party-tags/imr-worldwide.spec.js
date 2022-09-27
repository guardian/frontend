import { imrWorldwide } from './imr-worldwide';

const { shouldRun, url } = imrWorldwide;
const onLoad = imrWorldwide.onLoad;

/**
 * we have to mock config like this because
 * loading imr-worldwide has side affects
 * that are dependent on config.
 * */

jest.mock('../../../../lib/config', () => {
	const defaultConfig = {
		switches: {
			imrWorldwide: true,
		},
		page: {
			headline: 'Starship Enterprise',
			author: 'Captain Kirk',
			section: 'spaceexploration',
			sectionName: 'Space Exploration',
			keywords: 'Space,Travel',
			webPublicationDate: 1498113262000,
			isFront: false,
			isPaidContent: true,
			pageId: 100,
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

jest.mock('../../../common/modules/commercial/geo-utils', () => ({
	isInAuOrNz: jest.fn().mockReturnValue(true),
}));

jest.mock('../../../common/modules/experiments/ab', () => ({
	isInVariantSynchronous: jest.fn(),
}));

const nSdkInstance = {
	ggInitialize: jest.fn(),
	ggPM: jest.fn(),
};

window.NOLCMB = {
	getInstance: jest.fn(() => nSdkInstance),
};

describe('third party tag IMR in AUS', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	afterAll(() => {
		jest.clearAllMocks();
	});

	it('should initalize, with a brand-only apid on an unmatched section', () => {
		// If a section does not exist in guMetadata, it will use the default apid
		const expectedNolggParams = {
			sfcode: 'dcr',
			apid: 'P0EE0F4F4-8D7C-4082-A2A4-82C84728DC59',
			apn: 'theguardian',
		};
		onLoad();
		expect(nSdkInstance.ggInitialize).toBeCalledWith(expectedNolggParams);
	});

	it('should call nSdkInstance.ggPM with staticstart and dcrStaticMetadata', () => {
		const expectedMetadata = {
			assetid: 100,
			section: 'The Guardian - brand only',
			type: 'static',
		};
		onLoad();
		expect(nSdkInstance.ggPM).toBeCalledWith(
			'staticstart',
			expectedMetadata,
		);
	});
});
