import { hasRequiredConsents } from './hasRequiredConsents';

const brazeVendorId = '5ed8c49c4b8ce4571c7ad801';

let mockOnConsentChangeResult;
jest.mock('@guardian/consent-management-platform', () => ({
	onConsentChange: (callback) => {
		callback(mockOnConsentChangeResult);
	},
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	getConsentFor: jest.requireActual('@guardian/consent-management-platform')
		.getConsentFor,
}));

afterEach(() => {
	mockOnConsentChangeResult = undefined;
});

describe('hasRequiredConsents', () => {
	describe('when the user is covered by tcfv2 and consent is given', () => {
		it('returns a promise which resolves with true', async () => {
			mockOnConsentChangeResult = {
				tcfv2: {
					vendorConsents: {
						[brazeVendorId]: true,
					},
				},
			};
			await expect(hasRequiredConsents()).resolves.toBe(true);
		});
	});

	describe('when the user is covered by tcfv2 and consent is not given', () => {
		it('returns a promise which resolves with false', async () => {
			mockOnConsentChangeResult = {
				tcfv2: {
					vendorConsents: {
						[brazeVendorId]: false,
					},
				},
			};

			await expect(hasRequiredConsents()).resolves.toBe(false);
		});
	});

	describe('when the user is covered by ccpa and consent is given', () => {
		it('returns a promise which resolves with true', async () => {
			mockOnConsentChangeResult = {
				ccpa: {
					doNotSell: false,
				},
			};

			await expect(hasRequiredConsents()).resolves.toBe(true);
		});
	});

	describe('when the user is covered by ccpa and consent is not given', () => {
		it('returns a promise which resolves with false', async () => {
			mockOnConsentChangeResult = {
				ccpa: {
					doNotSell: true,
				},
			};

			await expect(hasRequiredConsents()).resolves.toBe(false);
		});
	});

	describe('when the user is covered by aus and consent is given', () => {
		it('returns a promise which resolves with true', async () => {
			mockOnConsentChangeResult = {
				aus: {
					personalisedAdvertising: true,
				},
			};

			await expect(hasRequiredConsents()).resolves.toBe(true);
		});
	});

	describe('when the user is covered by aus and consent is not given', () => {
		it('returns a promise which resolves with false', async () => {
			mockOnConsentChangeResult = {
				aus: {
					personalisedAdvertising: false,
				},
			};

			await expect(hasRequiredConsents()).resolves.toBe(false);
		});
	});
});
