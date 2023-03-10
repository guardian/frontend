/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import { _ } from './prepare-ad-verification';

jest.mock('../../../../lib/raven');
jest.mock('ophan/ng', () => null);
jest.mock('@guardian/libs', () => ({
	storage: {
		local: {
			get: () => false,
		},
	},
	loadScript: (...args: unknown[]): Promise<unknown> => {
		if (scriptLoadShouldFail) return Promise.reject();
		window.confiant = {
			settings: {
				callback: () => {
					console.log('callback to override', args);
				},
			},
		};
		return Promise.resolve();
	},
	log: jest.fn((...args) => mockLog(...args)),
}));
jest.mock('../../../common/modules/experiments/ab', () => ({
	isInVariantSynchronous: jest.fn(() => mockVariantSynchronous()),
}));
jest.mock('../dfp/get-advert-by-id', () => ({
	getAdvertById: jest.fn((id: string) => {
		if (!validIds.includes(id)) return null;
		return {
			id,
			slot: { setTargeting: jest.fn() },
		};
	}),
}));
jest.mock('../dfp/load-advert', () => ({
	refreshAdvert: jest.fn(),
}));

const validIds = ['slot-a', 'slot-2'];

const mockVariantSynchronous = jest.fn<boolean, unknown[]>();
const mockLog = jest.fn<void, unknown[]>();

const { init, maybeRefreshBlockedSlotOnce } = _;

let scriptLoadShouldFail = false;

describe('prepare-ad-verification', () => {
	beforeAll(() => {
		window.guardian.config.switches.confiantAdVerification = true;
	});

	afterEach(() => {
		scriptLoadShouldFail = false;
		delete window.confiant;
	});

	it('should register the callback', async () => {
		await init();
		expect(window.confiant?.settings.callback).toBe(
			maybeRefreshBlockedSlotOnce,
		);
	});

	it('should not register the callback if the script fails to load', async () => {
		scriptLoadShouldFail = true;
		await init();
		expect(window.confiant?.settings.callback).toBe(undefined);
	});

	describe('maybeRefreshBlockedSlotOnce', () => {
		it('should log data', () => {
			maybeRefreshBlockedSlotOnce(1, 'abc', true, 'def', 'ghi', {
				prebid: { s: 'slot-a' },
			});
			expect(mockLog).toHaveBeenLastCalledWith(
				'commercial',
				'🚫 Blocked bad ad with Confiant',
				expect.any(Object),
			);
		});

		it('should only refresh an ad slot once', async () => {
			jest.resetModules();
			mockVariantSynchronous.mockReturnValue(true);

			const { confiantRefreshedSlots, maybeRefreshBlockedSlotOnce } = (
				await import('./prepare-ad-verification')
			)._;

			[
				'slot-a',
				'slot-a',
				'slot-a',
				'slot-a',
				'slot-2',
				'slot-2',
				'slot-2',
			].map((slot) => {
				maybeRefreshBlockedSlotOnce(1, 'abc', true, 'def', 'ghi', {
					prebid: { s: slot },
				});
			});

			expect(confiantRefreshedSlots).toStrictEqual(['slot-a', 'slot-2']);
		});

		it('should ignore non-existing ad slots', async () => {
			jest.resetModules();

			const { maybeRefreshBlockedSlotOnce } = (
				await import('./prepare-ad-verification')
			)._;

			expect(() => {
				maybeRefreshBlockedSlotOnce(1, 'abc', true, 'def', 'ghi', {
					prebid: { s: 'not-a-slot' },
				});
			}).toThrow('No slot found for ');
		});
	});
});
