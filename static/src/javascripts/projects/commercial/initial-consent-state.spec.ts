import { onConsentChange } from '@guardian/consent-management-platform';
import type {
	Callback,
	ConsentState,
} from '@guardian/consent-management-platform/dist/types';
import type { AUSConsentState } from '@guardian/consent-management-platform/dist/types/aus';
import type { CCPAConsentState } from '@guardian/consent-management-platform/dist/types/ccpa';
import type { TCFv2ConsentState } from '@guardian/consent-management-platform/dist/types/tcfv2';
import { getInitialConsentState } from './initial-consent-state';

jest.mock('@guardian/consent-management-platform', () => ({
	onConsentChange: jest.fn(),
}));

const tcfv2ConsentState: TCFv2ConsentState = {
	consents: { 1: false },
	eventStatus: 'tcloaded',
	vendorConsents: {
		['5efefe25b8e05c06542b2a77']: true,
	},
	addtlConsent: 'xyz',
	gdprApplies: true,
	tcString: 'YAAA',
};

const ccpaConsentState: CCPAConsentState = {
	doNotSell: false,
};

const ausConsentState: AUSConsentState = {
	personalisedAdvertising: true,
};

const mockOnConsentChange = (consentState: ConsentState) =>
	(onConsentChange as jest.Mock).mockImplementation((cb: Callback) =>
		cb(consentState),
	);

describe('getInitialConsentState', () => {
	test('tcfv2 with event-status not equal to `cmpuishown` resolves immediately', async () => {
		const consentState: ConsentState = {
			tcfv2: tcfv2ConsentState,
			canTarget: false,
			framework: "tcfv2"
		};
		mockOnConsentChange(consentState);
		const resolvedConsentState = await getInitialConsentState();
		expect(resolvedConsentState).toBe(consentState);
	});
	test('ccpa resolves immediately', async () => {
		const consentState: ConsentState = {
			ccpa: ccpaConsentState,
			canTarget: true,
			framework: "ccpa"
		};
		mockOnConsentChange(consentState);
		const resolvedConsentState = await getInitialConsentState();
		expect(resolvedConsentState).toBe(consentState);
	});
	test('aus resolves immediately', async () => {
		const consentState: ConsentState = {
			aus: ausConsentState,
			canTarget: true,
			framework: "aus"
		};
		mockOnConsentChange(consentState);
		const resolvedConsentState = await getInitialConsentState();
		expect(resolvedConsentState).toBe(consentState);
	});
	test('unknown region rejects', async () => {
		const consentState = {
			canTarget: false,
			framework: null
		} as ConsentState;
		mockOnConsentChange(consentState);
		await expect(getInitialConsentState()).rejects.toEqual(
			'Unknown framework',
		);
	});
});
