import { onConsentChange } from '@guardian/consent-management-platform';
import type {
	Callback,
	ConsentState,
} from '@guardian/consent-management-platform/dist/types';
import { _ } from './reload-page-on-consent-change';

// we need to bypass the `once()` wrapper for testing
const { _reloadPageOnConsentChange: reloadPageOnConsentChange } = _;

jest.mock('@guardian/consent-management-platform', () => ({
	onConsentChange: jest.fn(),
}));

const mockOnConsentChange = (consentState: ConsentState) =>
	(onConsentChange as jest.Mock).mockImplementation((cb: Callback) =>
		cb(consentState),
	);

const reload = jest.fn();

jest.spyOn(window, 'location', 'get').mockImplementation(
	() => ({ reload } as unknown as Location),
);

describe('reloadPageOnConsentChange()', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('reloads if the value of canTarget changes from true to false', () => {
		const initialConsentState: ConsentState | undefined = {
			canTarget: true,
			framework: 'tcfv2',
		};
		const consentState: ConsentState = {
			canTarget: false,
			framework: 'tcfv2',
		};

		mockOnConsentChange(initialConsentState);
		reloadPageOnConsentChange();
		mockOnConsentChange(consentState);
		reloadPageOnConsentChange();

		expect(reload).toBeCalled();
	});

	it('does not reload if the value of canTarget stays the same', () => {
		const initialConsentState: ConsentState | undefined = {
			canTarget: true,
			framework: 'tcfv2',
		};
		const consentState: ConsentState = {
			canTarget: true,
			framework: 'tcfv2',
		};

		mockOnConsentChange(initialConsentState);
		reloadPageOnConsentChange();
		mockOnConsentChange(consentState);
		reloadPageOnConsentChange();

		expect(reload).not.toBeCalled();
	});
});
