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
	log: jest.fn(() => mockLog),
}));
jest.mock('../../../common/modules/experiments/ab', () => ({
	isInVariantSynchronous: jest.fn(() => mockVariantSynchronous()),
}));

const mockVariantSynchronous = jest.fn<boolean, unknown[]>();
const mockLog = jest.fn<void, unknown[]>();

const { init, maybeRefreshBlockedSlotOnce, shouldRefresh } = _;

let scriptLoadShouldFail = false;

describe('prepare-ad-verification', () => {
	beforeAll(() => {
		window.guardian.config.switches.confiantAdVerification = true;
	});

	beforeEach(() => {
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

		const refreshAdSlot = (s: string) => {
			maybeRefreshBlockedSlotOnce(1, 'abc', true, 'def', 'ghi', {
				prebid: { s },
			});
		};

		it('should only refresh an ad slot once', async () => {
			mockVariantSynchronous.mockReturnValue(true);

			[
				'slot-a',
				'slot-a',
				'slot-a',
				'slot-a',
				'slot-2',
				'slot-2',
				'not-a-slot', // should not appear as refreshed
			].map((slot) => {
				refreshAdSlot(slot);
			});

			const { confiantRefreshedSlots } = (
				await import('./prepare-ad-verification')
			)._;

			expect(confiantRefreshedSlots).toStrictEqual(['slot-a', 'slot-2']);
		});

		it('should not refresh ad slots if not in variant', async () => {
			jest.resetModuleRegistry();
			mockVariantSynchronous.mockReturnValue(false);

			['slot-2', 'slot-a', 'slot-unused', 'not-a-slot'].map((slot) => {
				refreshAdSlot(slot);
			});

			const { confiantRefreshedSlots } = (
				await import('./prepare-ad-verification')
			)._;

			expect(confiantRefreshedSlots).toStrictEqual([]);
		});
	});
});
