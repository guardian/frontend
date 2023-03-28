/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import { onConsentChange } from '@guardian/consent-management-platform';
import type {
	Callback,
	ConsentState,
} from '@guardian/consent-management-platform/dist/types';
import * as ActualManageAdFreeCookie from 'lib/manage-ad-free-cookie';
import { _ } from './manage-ad-free-cookie-on-consent-change';

// we need too bypass the `once()` wrapper for testing
const {
	_manageAdFreeCookieOnConsentChange: manageAdFreeCookieOnConsentChange,
} = _;

const { AdFreeCookieReasons, setAdFreeCookie, maybeUnsetAdFreeCookie } =
	ActualManageAdFreeCookie;

jest.mock('@guardian/consent-management-platform', () => ({
	onConsentChange: jest.fn(),
}));

jest.mock('lib/manage-ad-free-cookie', () => {
	const originalModule: typeof ActualManageAdFreeCookie = jest.requireActual(
		'lib/manage-ad-free-cookie',
	);

	return {
		...originalModule,
		setAdFreeCookie: jest.fn(),
		maybeUnsetAdFreeCookie: jest.fn(),
	};
});

const mockOnConsentChange = (consentState: ConsentState) =>
	(onConsentChange as jest.Mock).mockImplementation((cb: Callback) =>
		cb(consentState),
	);

// (_.once as jest.Mock).mockImplementation((cb: () => void) => cb);

describe('manageAdFreeCookieOnConsentChange()', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('tcfv2 canTarget: false', () => {
		const consentState: ConsentState = {
			canTarget: false,
			framework: 'tcfv2',
		};

		mockOnConsentChange(consentState);

		manageAdFreeCookieOnConsentChange();

		expect(setAdFreeCookie).toBeCalledWith(
			AdFreeCookieReasons.ConsentOptOut,
		);
	});

	it(`tcfv2 canTarget: true`, () => {
		const consentState: ConsentState = {
			canTarget: true,
			framework: 'tcfv2',
		};

		mockOnConsentChange(consentState);

		manageAdFreeCookieOnConsentChange();

		expect(maybeUnsetAdFreeCookie).toBeCalledWith(
			AdFreeCookieReasons.ConsentOptOut,
		);
	});

	it.each([
		{
			framework: 'aus',
			canTarget: false,
		},
		{
			framework: 'aus',
			canTarget: true,
		},
		{
			framework: 'ccpa',
			canTarget: false,
		},
		{
			framework: 'ccpa',
			canTarget: true,
		},
	] as const)(
		'$framework canTarget: $canTarget',
		({ framework, canTarget }) => {
			const consentState: ConsentState = {
				canTarget,
				framework,
			};

			mockOnConsentChange(consentState);

			manageAdFreeCookieOnConsentChange();

			expect(maybeUnsetAdFreeCookie).not.toBeCalled();
			expect(setAdFreeCookie).not.toBeCalled();
		},
	);
});
