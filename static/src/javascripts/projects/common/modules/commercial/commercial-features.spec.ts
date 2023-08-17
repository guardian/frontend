/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated
 */

import { commercialFeatures } from './commercial-features';
import type { CommercialFeaturesConstructor } from './commercial-features';
import { isAdFreeUser } from './user-features';

const CommercialFeatures =
	commercialFeatures.constructor as CommercialFeaturesConstructor;

jest.mock('./user-features', () => ({
	isPayingMember: jest.fn(),
	isRecentOneOffContributor: jest.fn(),
	shouldHideSupportMessaging: jest.fn(),
	isAdFreeUser: jest.fn(),
}));

describe('Commercial features', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		window.location.hash = '';
		(isAdFreeUser as jest.Mock).mockReturnValue(false);
		expect.hasAssertions();
	});

	describe('adFree', () => {
		it('Is disabled for speedcurve tests in ad-free mode', () => {
			window.location.hash = '#noadsaf';
			const features = new CommercialFeatures();
			expect(features.adFree).toBe(true);
		});

		it('Is disabled when the user is ad free', () => {
			(isAdFreeUser as jest.Mock).mockReturnValue(true);
			const features = new CommercialFeatures();
			expect(features.adFree).toBe(true);
		});
	});
});
