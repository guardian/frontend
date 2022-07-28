import { brazeVendorId, hasRequiredConsents } from './brazeBanner';

jest.mock('../../../../../lib/raven');
jest.mock('ophan/ng', () => null);

let mockOnConsentChangeResult;
jest.mock('@guardian/consent-management-platform', () => ({
	onConsentChange: (callback) => {
		callback(mockOnConsentChangeResult);
	},
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
});
