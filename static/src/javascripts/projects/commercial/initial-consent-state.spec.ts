import { onConsentChange } from '@guardian/consent-management-platform';
import type { Callback } from '@guardian/consent-management-platform/dist/types';
import { getInitialConsentState } from './initial-consent-state';

jest.mock('@guardian/consent-management-platform', () => ({
	onConsentChange: jest.fn(),
}));

describe('getInitialConsentState', () => {
	test('ccpa resolves immediately', async () => {
		const ccpaConsentState = {
			ccpa: {
				doNotSell: false,
			},
		};
		(onConsentChange as jest.Mock).mockImplementation((cb: Callback) =>
			cb(ccpaConsentState),
		);
		const resolvedConsentState = await getInitialConsentState();
		expect(resolvedConsentState).toBe(ccpaConsentState);
	});
	test('aus resolves immediately', async () => {
		const ausConsentState = {
			aus: {
				personalisedAdvertising: true,
			},
		};
		(onConsentChange as jest.Mock).mockImplementation((cb: Callback) =>
			cb(ausConsentState),
		);
		const resolvedConsentState = await getInitialConsentState();
		expect(resolvedConsentState).toBe(ausConsentState);
	});
});
