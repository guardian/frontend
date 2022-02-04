import { onConsentChange } from '@guardian/consent-management-platform';
import type { Callback } from '@guardian/consent-management-platform/dist/types';
import type { TCEventStatusCode } from '@guardian/consent-management-platform/dist/types/tcfv2';
import { getInitialConsentState } from './initial-consent-state';

jest.mock('@guardian/consent-management-platform', () => ({
	onConsentChange: jest.fn(),
}));

const buildTcfv2ConsentState = (eventStatus: string) => ({
	tcfv2: {
		consents: { 1: false },
		eventStatus: eventStatus as TCEventStatusCode,
		vendorConsents: {
			['5efefe25b8e05c06542b2a77']: true,
		},
		addtlConsent: 'xyz',
		gdprApplies: true,
		tcString: 'YAAA',
	},
});

describe('getInitialConsentState', () => {
	test('tcfv2 with event-status not equal to `cmpuishown` resolves immediately', async () => {
		const tcfv2ConsentState = buildTcfv2ConsentState('tcloaded');
		(onConsentChange as jest.Mock).mockImplementation((cb: Callback) =>
			cb(tcfv2ConsentState),
		);
		const resolvedConsentState = await getInitialConsentState();
		expect(resolvedConsentState).toBe(tcfv2ConsentState);
	});
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
	test('unknown region rejects', async () => {
		const consentState = {};
		(onConsentChange as jest.Mock).mockImplementation((cb: Callback) =>
			cb(consentState),
		);
		await expect(getInitialConsentState()).rejects.toEqual(
			'Unknown framework',
		);
	});
});
