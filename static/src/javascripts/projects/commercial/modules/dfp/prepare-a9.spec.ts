import { commercialFeatures } from '../../../common/modules/commercial/commercial-features';
import { a9 } from '../header-bidding/a9/a9';
import { dfpEnv } from './dfp-env';
import { _ } from './prepare-a9';

const { setupA9 } = _;

jest.mock('../../../common/modules/commercial/geo-utils');

jest.mock('../../../common/modules/commercial/commercial-features', () => ({
	commercialFeatures: {},
}));

jest.mock('../header-bidding/a9/a9');

jest.mock('./Advert');

jest.mock('../../../../lib/a9-apstag', () => jest.fn());

jest.mock('../../../common/modules/commercial/build-page-targeting');

jest.mock('../header-bidding/prebid/bid-config');

jest.mock('../header-bidding/utils', () => ({
	isInUsRegion: () => true,
}));

jest.mock('@guardian/consent-management-platform');

jest.mock('@guardian/libs');

const originalUA = navigator.userAgent;
const fakeUserAgent = (userAgent?: string) => {
	Object.defineProperty(navigator, 'userAgent', {
		get: () => userAgent ?? originalUA,
		configurable: true,
	});
};

describe('init', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		fakeUserAgent();
	});

	afterAll(() => {
		jest.clearAllMocks();
	});

	it('should initialise A9 when A9 switch is ON and advertising is on and ad-free is off', async () => {
		dfpEnv.hbImpl = { a9: true, prebid: false };
		commercialFeatures.dfpAdvertising = true;
		commercialFeatures.adFree = false;
		await setupA9();
		expect(a9.initialise).toBeCalled();
	});

	it('should initialise A9 when both prebid and a9 switches are ON and advertising is on and ad-free is off', async () => {
		dfpEnv.hbImpl = { a9: true, prebid: true };
		commercialFeatures.dfpAdvertising = true;
		commercialFeatures.adFree = false;
		await setupA9();
		expect(a9.initialise).toBeCalled();
	});

	it('should not initialise A9 when useragent is Google Web Preview', async () => {
		fakeUserAgent('Google Web Preview');
		await setupA9();
		expect(a9.initialise).not.toBeCalled();
	});

	it('should not initialise A9 when no external demand', async () => {
		dfpEnv.hbImpl = { a9: false, prebid: false };
		await setupA9();
		expect(a9.initialise).not.toBeCalled();
	});

	it('should not initialise a9 when advertising is switched off', async () => {
		dfpEnv.hbImpl = { a9: true, prebid: false };
		commercialFeatures.dfpAdvertising = false;
		commercialFeatures.adFree = false;
		await setupA9();
		expect(a9.initialise).not.toBeCalled();
	});

	it('should not initialise a9 when ad-free is on', async () => {
		dfpEnv.hbImpl = { a9: true, prebid: false };
		commercialFeatures.dfpAdvertising = true;
		commercialFeatures.adFree = true;
		await setupA9();
		expect(a9.initialise).not.toBeCalled();
	});

	it('should not initialise a9 when the page has a pageskin', async () => {
		dfpEnv.hbImpl = { a9: true, prebid: false };
		commercialFeatures.dfpAdvertising = true;
		commercialFeatures.adFree = false;
		window.guardian.config.page.hasPageSkin = true;
		await setupA9();
		expect(a9.initialise).not.toBeCalled();
	});

	it('should initialise a9 when the page has no pageskin', async () => {
		dfpEnv.hbImpl = { a9: true, prebid: false };
		commercialFeatures.dfpAdvertising = true;
		commercialFeatures.adFree = false;
		window.guardian.config.page.hasPageSkin = false;
		await setupA9();
		expect(a9.initialise).toBeCalled();
	});

	it('should not initialise a9 on the secure contact pages', async () => {
		dfpEnv.hbImpl = { a9: true, prebid: false };
		commercialFeatures.dfpAdvertising = true;
		commercialFeatures.adFree = false;
		commercialFeatures.isSecureContact = true;
		await setupA9();
		expect(a9.initialise).not.toBeCalled();
	});
});
