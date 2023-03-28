/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import { imrWorldwide } from './imr-worldwide';

const { shouldRun, url } = imrWorldwide;
const onLoad = imrWorldwide.onLoad;

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
		Object.assign(window.guardian.config, {
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
		});
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
