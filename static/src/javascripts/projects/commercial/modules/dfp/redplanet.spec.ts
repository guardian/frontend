import {
	getConsentFor,
	onConsent,
} from '@guardian/consent-management-platform';
import type { ConsentState } from '@guardian/consent-management-platform/dist/types';
import { log } from '@guardian/libs';
import config from '../../../../lib/config';
import { commercialFeatures } from '../../../common/modules/commercial/commercial-features';
import { isInAuOrNz as isInAuOrNz_ } from '../../../common/modules/commercial/geo-utils';
import { init, resetModule } from './redplanet';

const isInAuOrNz = isInAuOrNz_ as jest.MockedFunction<typeof isInAuOrNz_>;

const AusWithConsent = {
	aus: { personalisedAdvertising: true },
	canTarget: true,
	framework: 'aus',
} as ConsentState;

const AusWithoutConsent = {
	aus: { personalisedAdvertising: true },
	canTarget: false,
	framework: 'aus',
} as ConsentState;

const CcpaWithConsent = {
	ccpa: { doNotSell: false },
	canTarget: true,
	framework: 'ccpa',
} as ConsentState;

jest.mock('lib/raven');

jest.mock('../../../common/modules/commercial/commercial-features', () => ({
	commercialFeatures: {},
}));

jest.mock('./Advert');

jest.mock('../../../common/modules/commercial/geo-utils');

jest.mock('../../../common/modules/experiments/ab');

jest.mock('../../../../lib/cookies');

jest.mock('../../../../lib/launchpad');

jest.mock('../../../common/modules/commercial/build-page-targeting');

jest.mock('@guardian/consent-management-platform');

jest.mock('@guardian/libs');

window.launchpad = jest.fn().mockImplementationOnce(() => jest.fn());

const mockOnConsent = (consentState: ConsentState) =>
	(onConsent as jest.Mock).mockReturnValueOnce(Promise.resolve(consentState));

const mockGetConsentFor = (hasConsent: boolean) =>
	(getConsentFor as jest.Mock).mockReturnValueOnce(hasConsent);

describe('init', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		resetModule();
	});

	afterAll(() => {
		jest.clearAllMocks();
	});

	it('should initialise redplanet when all conditions are true with right params', async () => {
		commercialFeatures.launchpad = true;
		isInAuOrNz.mockReturnValue(true);
		config.set('ophan.browserId', '123');
		config.set('page.section', 'uk');
		config.set('page.sectionName', 'Politics');
		config.set('page.contentType', 'Article');
		mockOnConsent(AusWithConsent);
		mockGetConsentFor(true);

		await init();

		const expectedNewTrackerCall = [
			'newTracker',
			'launchpad',
			'lpx.qantas.com',
			{
				appId: 'the-guardian',
				discoverRootDomain: true,
			},
		];
		const expectedTrackUnstructEventCall = [
			'trackUnstructEvent',
			{
				schema: 'iglu:com.qantas.launchpad/hierarchy/jsonschema/1-0-0',
				data: {
					u1: 'theguardian.com',
					u2: 'uk',
					u3: 'Politics',
					u4: 'Article',
					uid: '123',
				},
			},
		];
		expect(
			(window.launchpad as jest.MockedFunction<typeof window.launchpad>)
				.mock.calls,
		).toEqual([expectedNewTrackerCall, expectedTrackUnstructEventCall]);
	});

	it('should initialise redplanet when TCFv2 consent has been given', async () => {
		commercialFeatures.launchpad = true;
		isInAuOrNz.mockReturnValue(true);
		mockOnConsent(AusWithConsent);
		mockGetConsentFor(true);
		await init();
		expect(window.launchpad).toBeCalled();
	});

	it('should not initialise redplanet when TCFv2 consent has not been given', async () => {
		commercialFeatures.launchpad = true;
		isInAuOrNz.mockReturnValue(true);
		mockOnConsent(AusWithoutConsent);
		mockGetConsentFor(false);
		await init();
		expect(log).toHaveBeenCalledWith(
			'commercial',
			expect.stringContaining('Failed to execute redplanet'),
			expect.stringContaining('No consent for redplanet'),
		);
		expect(window.launchpad).not.toBeCalled();
	});

	it('should throw an error when on CCPA mode', async () => {
		commercialFeatures.launchpad = true;
		isInAuOrNz.mockReturnValue(true);
		mockOnConsent(CcpaWithConsent);
		mockGetConsentFor(true);
		await init();
		expect(log).toHaveBeenCalledWith(
			'commercial',
			expect.stringContaining('Failed to execute redplanet'),
			expect.stringContaining(
				'Redplanet should only run in Australia on AUS mode',
			),
		);
		expect(window.launchpad).not.toBeCalled();
	});

	it('should not initialise redplanet when launchpad conditions are false', async () => {
		commercialFeatures.launchpad = false;
		isInAuOrNz.mockReturnValue(true);
		mockOnConsent(AusWithConsent);
		mockGetConsentFor(true);
		await init();
		expect(window.launchpad).not.toBeCalled();
	});

	it('should not initialise redplanet when user not in AUS regions', async () => {
		commercialFeatures.launchpad = true;
		isInAuOrNz.mockReturnValue(false);
		mockOnConsent(AusWithConsent);
		mockGetConsentFor(true);
		await init();
		expect(window.launchpad).not.toBeCalled();
	});
});
