import type { RegisterListener } from '@guardian/commercial/core';
import { trackNativeAdLinkClick } from '../../../common/modules/analytics/google';
import { init } from './click';

jest.mock('../../../common/modules/analytics/google', () => ({
	trackNativeAdLinkClick: jest.fn(),
}));

describe('init click listener', () => {
	test('Listener receives undefined linkName and undefined iframe', () => {
		(trackNativeAdLinkClick as jest.Mock).mockReset();

		const mockedRegister: RegisterListener = (type, callback) =>
			callback(undefined, undefined, undefined);

		// Call the function under test
		init(mockedRegister);

		expect(trackNativeAdLinkClick).toHaveBeenCalled();
		expect((trackNativeAdLinkClick as jest.Mock).mock.calls).toEqual([
			['unknown', ''],
		]);
	});

	test('Listener receives string linkName and undefined iframe', () => {
		(trackNativeAdLinkClick as jest.Mock).mockReset();

		// Expected values
		const expectedLinkName = 'linkName';
		const expectedAdSlotId = 'unknown';

		const mockedRegister: RegisterListener = (type, callback) =>
			callback(expectedLinkName, undefined, undefined);

		// Call the function under test
		init(mockedRegister);

		expect(trackNativeAdLinkClick).toHaveBeenCalled();
		expect((trackNativeAdLinkClick as jest.Mock).mock.calls).toEqual([
			[expectedAdSlotId, expectedLinkName],
		]);
	});

	test('Listener receives invalid type of linkName and undefined iframe', () => {
		(trackNativeAdLinkClick as jest.Mock).mockReset();

		const invalidLinkName = 0;

		// Expected values
		const expectedLinkName = '';
		const expectedAdSlotId = 'unknown';

		const mockedRegister: RegisterListener = (type, callback) =>
			callback(invalidLinkName, undefined, undefined);

		// Call the function under test
		init(mockedRegister);

		expect(trackNativeAdLinkClick).toHaveBeenCalled();
		expect((trackNativeAdLinkClick as jest.Mock).mock.calls).toEqual([
			[expectedAdSlotId, expectedLinkName],
		]);
	});

	test('Listener receives string linkName and iframe with no ad slot', () => {
		(trackNativeAdLinkClick as jest.Mock).mockReset();

		// Expected values
		const expectedLinkName = 'linkName';
		const expectedAdSlotId = 'unknown';

		const mockedRegister: RegisterListener = (type, callback) =>
			callback(
				expectedLinkName,
				undefined,
				document.createElement('iframe'),
			);

		// Call the function under test
		init(mockedRegister);

		expect(trackNativeAdLinkClick).toHaveBeenCalled();
		expect((trackNativeAdLinkClick as jest.Mock).mock.calls).toEqual([
			[expectedAdSlotId, expectedLinkName],
		]);
	});

	test('Listener receives string linkName and iframe with parent ad slot', () => {
		(trackNativeAdLinkClick as jest.Mock).mockReset();

		// Expected values
		const expectedLinkName = 'linkName';
		const expectedAdSlotId = 'adSlotId';

		// Create an ad-slot element with an iframe child
		// and give the ad slot the id that we'll expect the track function to be called with
		const adSlot = document.createElement('div');
		adSlot.setAttribute('id', expectedAdSlotId);
		adSlot.classList.add('js-ad-slot');
		const creativeIframe = document.createElement('iframe');
		adSlot.appendChild(creativeIframe);

		const mockedRegister: RegisterListener = (type, callback) =>
			callback(expectedLinkName, undefined, creativeIframe);

		// Call the function under test
		init(mockedRegister);

		expect(trackNativeAdLinkClick).toHaveBeenCalled();
		expect((trackNativeAdLinkClick as jest.Mock).mock.calls).toEqual([
			[expectedAdSlotId, expectedLinkName],
		]);
	});
});
