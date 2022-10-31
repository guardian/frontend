import type {
	Callback,
	ConsentState,
	GetConsentFor,
} from '@guardian/consent-management-platform/dist/types';
import { hasRequiredConsents } from './hasRequiredConsents';

const brazeVendorId = '5ed8c49c4b8ce4571c7ad801';

let mockOnConsentChangeResult: ConsentState | undefined;
jest.mock('@guardian/consent-management-platform', () => ({
	onConsentChange: (callback: Callback) => {
		if (mockOnConsentChangeResult) {
			callback(mockOnConsentChangeResult);
		}
	},
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- we know getConsentFor is available here
	getConsentFor: jest.requireActual('@guardian/consent-management-platform')
		.getConsentFor as GetConsentFor,
}));

afterEach(() => {
	mockOnConsentChangeResult = undefined;
});

describe('hasRequiredConsents', () => {
	describe('when the user is covered by tcfv2 and consent is given', () => {
		it('returns a promise which resolves with true', async () => {
			mockOnConsentChangeResult = {
				tcfv2: {
					consents: {},
					gdprApplies: true,
					eventStatus: 'tcloaded',
					vendorConsents: {
						[brazeVendorId]: true,
					},
					tcString: 'testTcString',
					addtlConsent: 'testaddtlConsent',
				},
				canTarget: true,
				framework: 'tcfv2',
			};
			await expect(hasRequiredConsents()).resolves.toBe(true);
		});
	});

	describe('when the user is covered by tcfv2 and consent is not given', () => {
		it('returns a promise which resolves with false', async () => {
			mockOnConsentChangeResult = {
				tcfv2: {
					consents: {},
					gdprApplies: true,
					eventStatus: 'tcloaded',
					vendorConsents: {
						[brazeVendorId]: false,
					},
					tcString: 'testTcString',
					addtlConsent: 'testaddtlConsent',
				},
				canTarget: true,
				framework: 'tcfv2',
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
				canTarget: true,
				framework: 'ccpa',
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
				canTarget: false,
				framework: 'ccpa',
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
				canTarget: true,
				framework: 'aus',
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
				canTarget: false,
				framework: 'aus',
			};

			await expect(hasRequiredConsents()).resolves.toBe(false);
		});
	});
});
