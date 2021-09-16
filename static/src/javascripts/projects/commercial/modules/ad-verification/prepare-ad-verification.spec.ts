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
	getAdvertById: jest.fn((id: string) => ({
		id,
		slot: { setTargeting: jest.fn() },
	})),
}));
jest.mock('../dfp/load-advert', () => ({
	refreshAdvert: jest.fn(),
}));

const mockVariantSynchronous = jest.fn<boolean, unknown[]>();
const mockLog = jest.fn<void, unknown[]>();

const { init, maybeRefreshBlockedSlotOnce, shouldRefresh } = _;

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

	describe('shouldRefresh', () => {
		it.each([true, false])(
			'return the value of isInVariantSynchronous: %s',
			(value) => {
				mockVariantSynchronous.mockReturnValue(value);

				expect(shouldRefresh()).toBe(value);
			},
		);
	});

	describe('maybeRefreshBlockedSlotOnce', () => {
		beforeAll(() => {
			const fakeSlot = (id: string) => {
				return {
					getSlotElementId: () => id,
				};
			};

			window.googletag = {
				// @ts-expect-error - this is a mock so type not totally compatible with Googletag
				pubads() {
					return {
						getSlots: () => [
							fakeSlot('slot-a'),
							fakeSlot('slot-2'),
							fakeSlot('slot-untouched'),
						],
					};
				},
			};
		});

		const maybeRefreshBlockedSlotOnceWithDefaultParams = (s: string) => {
			maybeRefreshBlockedSlotOnce(1, 'abc', true, 'def', 'ghi', {
				prebid: { s },
			});
		};

		it('should log data', () => {
			maybeRefreshBlockedSlotOnceWithDefaultParams('slot-a');
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
				'not-a-slot', // should not appear as refreshed
			].map((slot) => {
				maybeRefreshBlockedSlotOnce(1, 'abc', true, 'def', 'ghi', {
					prebid: { s: slot },
				});
			});

			expect(confiantRefreshedSlots).toStrictEqual(['slot-a', 'slot-2']);
		});

		it('should not refresh ad slots if not in variant', async () => {
			jest.resetModules();
			mockVariantSynchronous.mockReturnValue(false);

			const { confiantRefreshedSlots, maybeRefreshBlockedSlotOnce } = (
				await import('./prepare-ad-verification')
			)._;

			['slot-2', 'slot-a', 'slot-unused', 'not-a-slot'].map((slot) => {
				maybeRefreshBlockedSlotOnce(1, 'abc', true, 'def', 'ghi', {
					prebid: { s: slot },
				});
			});

			expect(confiantRefreshedSlots).toStrictEqual([]);
		});
	});
});
