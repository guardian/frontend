import type { Runnable, ABTest } from '@guardian/ab-core';
import {
	getAsyncTestsToRun,
	getSynchronousTestsToRun,
	isInVariantSynchronous,
	runAndTrackAbTests,
} from 'common/modules/experiments/ab';
import { NOT_IN_TEST } from 'common/modules/experiments/ab-constants';
import {
	getParticipationsFromLocalStorage,
	setParticipationsInLocalStorage,
} from 'common/modules/experiments/ab-local-storage';
import { concurrentTests } from 'common/modules/experiments/ab-tests';
import { runnableTestsToParticipations } from 'common/modules/experiments/ab-utils';
import { _ } from '../analytics/mvt-cookie';

const { overwriteMvtCookie } = _;

// This is required as loading these seems to cause an error locally (and in CI)
// because of some implicit dependency evil that I haven't been able to figure out.
jest.mock('common/modules/commercial/user-features', () => ({
	getLastOneOffContributionDate: () => null,
	isRecurringContributor: () => false,
	shouldNotBeShownSupportMessaging: () => false,
}));

function emptyFunction() {
	// do nothing
}

jest.mock('common/modules/experiments/ab-tests'); // __mocks__/ab-tests
jest.mock('common/modules/experiments/ab-ophan', () => ({
	registerImpressionEvents: emptyFunction,
	registerCompleteEvents: emptyFunction,
	trackABTests: emptyFunction,
	buildOphanPayload: emptyFunction,
}));
jest.mock(
	'lodash-es/memoize',
	() =>
		<T>(f: (...args: unknown[]) => T) =>
			f,
);

const cfg: DeepPartial<Config> = window.guardian.config;

describe('A/B', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		cfg.page = {};
		cfg.page.isSensitive = false;
		cfg.switches = {
			abDummyTest: true,
		};
		overwriteMvtCookie(1234);
		window.location.hash = '';
		setParticipationsInLocalStorage({});
	});

	afterEach(() => {
		delete cfg.page;
		delete cfg.switches;
	});

	describe('runAndTrackAbTests', () => {
		test('should run all concurrent tests whose canRun is true, but just the first epic test & first banner test', () => {
			cfg.switches = {
				abDummyTest: true,
				abDummyTest2: true,
				abDummyTest3CanRunIsFalse: true,
				abEpicTest: true,
				abEpicTest2: true,
				abBannerTest: true,
				abBannerTest2: true,
			};

			const shouldRun = [
				jest.spyOn(concurrentTests[0].variants[0], 'test'),
				jest.spyOn(concurrentTests[1].variants[0], 'test'),
			];

			const shouldNotRun = [
				jest.spyOn(concurrentTests[2].variants[0], 'test'),
			];

			expect.assertions(shouldRun.length + shouldNotRun.length);

			return runAndTrackAbTests().then(() => {
				shouldRun.forEach((spy) => expect(spy).toHaveBeenCalled());
				shouldNotRun.forEach((spy) =>
					expect(spy).not.toHaveBeenCalled(),
				);
			});
		});

		test('renamed/deleted tests should be removed from localStorage', () => {
			expect.assertions(1);

			setParticipationsInLocalStorage({
				noTestSwitchForThisOne: { variant: 'Control' },
			});

			return runAndTrackAbTests().then(() => {
				expect(getParticipationsFromLocalStorage()).toEqual({
					DummyTest: { variant: 'control' },
				});
			});
		});

		test('tests with notintest participations should not run, but this should be persisted to localStorage', () => {
			expect.assertions(3);

			const spy = jest.spyOn(concurrentTests[0].variants[0], 'test');
			expect(spy).not.toHaveBeenCalled();
			setParticipationsInLocalStorage({
				DummyTest: { variant: NOT_IN_TEST },
			});

			return runAndTrackAbTests().then(() => {
				expect(spy).not.toHaveBeenCalled();
				expect(getParticipationsFromLocalStorage()).toEqual({
					DummyTest: { variant: NOT_IN_TEST },
				});
			});
		});

		test('URL participations for non-existent variants that are not notintest should not be persisted to localStorage', () => {
			expect.assertions(1);

			window.location.hash = '#ab-DummyTest=bad_variant';

			return runAndTrackAbTests().then(() => {
				expect(getParticipationsFromLocalStorage()).toEqual({
					DummyTest: { variant: 'control' },
				});
			});
		});

		test('URL participations for tests which cannot be run on this pageview should not be persisted to localStorage', () => {
			expect.assertions(1);

			cfg.switches = {
				abDummyTest: true,
				abDummyTest2: true,
				abDummyTest3CanRunIsFalse: true,
			};
			window.location.hash = '#ab-DummyTest3CanRunIsFalse=control';

			return runAndTrackAbTests().then(() => {
				expect(getParticipationsFromLocalStorage()).toEqual({
					DummyTest: { variant: 'control' },
					DummyTest2: { variant: 'control' },
				});
			});
		});

		test('URL participations for variants which cannot be run should not be preserved in localStorage', () => {
			expect.assertions(1);

			cfg.switches = {
				abDummyTest: true,
				abDummyTest4ControlCanRunIsFalse: true,
			};
			window.location.hash = '#ab-DummyTest4ControlCanRunIsFalse=control';

			return runAndTrackAbTests().then(() => {
				expect(getParticipationsFromLocalStorage()).toEqual({
					DummyTest: { variant: 'control' },
				});
			});
		});

		test('URL participations for tests which can be run on this pageview should be persisted to localStorage', () => {
			expect.assertions(2);

			window.location.hash = '#ab-DummyTest=variant';
			expect(getSynchronousTestsToRun()[0].variantToRun.id).toEqual(
				'variant',
			);

			return runAndTrackAbTests().then(() => {
				expect(getParticipationsFromLocalStorage()).toEqual({
					DummyTest: { variant: 'variant' },
				});
			});
		});

		test('localStorage participations for non-existent variants that are not notintest should not be preserved in localStorage', () => {
			setParticipationsInLocalStorage({
				DummyTest: { variant: 'bad_variant' },
			});

			expect.assertions(1);
			return runAndTrackAbTests().then(() => {
				expect(getParticipationsFromLocalStorage()).toEqual({
					DummyTest: { variant: 'control' },
				});
			});
		});

		test('localStorage participations for tests which cannot be run should not be preserved in localStorage', () => {
			cfg.switches = {
				abDummyTest: true,
				abDummyTest2: true,
				abDummyTest3CanRunIsFalse: true,
			};

			setParticipationsInLocalStorage({
				DummyTest3CanRunIsFalse: { variant: 'bad_variant' },
			});

			expect.assertions(1);
			return runAndTrackAbTests().then(() => {
				expect(getParticipationsFromLocalStorage()).toEqual({
					DummyTest: { variant: 'control' },
					DummyTest2: { variant: 'control' },
				});
			});
		});

		test('localStorage participations for variants which cannot be run should not be preserved in localStorage', () => {
			cfg.switches = {
				abDummyTest: true,
				abDummyTest4ControlCanRunIsFalse: true,
			};

			setParticipationsInLocalStorage({
				DummyTest4ControlCanRunIsFalse: { variant: 'control' },
			});

			expect.assertions(1);
			return runAndTrackAbTests().then(() => {
				expect(getParticipationsFromLocalStorage()).toEqual({
					DummyTest: { variant: 'control' },
				});
			});
		});
	});

	describe('getTestsToRun', () => {
		// Note that memoize has been mocked to just call the function each time!
		// Otherwise this test would be a bit pointless
		test('should give the same result whether called before or after runAndTrackAbTests', () => {
			expect.assertions(2);

			cfg.switches = {
				abDummyTest: true,
				abDummyTest2: true,
				abEpicTest: true,
			};
			setParticipationsInLocalStorage({
				// this should be overriden by URL
				DummyTest: { variant: 'control' },

				// this should be respected (overriding the control, which would be the cookie-determined variant)
				DummyTest2: { variant: 'variant' },

				// this should be ignored & deleted
				NoTestSwitchForThisOne: { variant: 'blah' },

				// ...and we should get an EpicTest added
			});
			window.location.hash = '#ab-DummyTest=variant';

			const expectedSynchronousTestsToRun = {
				DummyTest: { variant: 'variant' },
				DummyTest2: { variant: 'variant' },
			};

			const expectedTestsToRun = {
				...expectedSynchronousTestsToRun,
			};

			const checkTests = (tests: ReadonlyArray<Runnable<ABTest>>) =>
				expect(runnableTestsToParticipations(tests)).toEqual(
					expectedTestsToRun,
				);

			return getAsyncTestsToRun()
				.then((asyncTests) =>
					checkTests([...asyncTests, ...getSynchronousTestsToRun()]),
				)
				.then(runAndTrackAbTests)
				.then(getAsyncTestsToRun)
				.then((asyncTests) =>
					checkTests([...asyncTests, ...getSynchronousTestsToRun()]),
				);
		});
	});

	describe('isInVariantSynchronous', () => {
		test('should respect the URL hash', () => {
			window.location.hash = '#ab-DummyTest=variant';
			expect(
				isInVariantSynchronous(concurrentTests[0], 'variant'),
			).toEqual(true);
		});

		test('should respect localStorage and MVT cookie', () => {
			cfg.switches = {
				abDummyTest: true,
				abDummyTest2: true,
			};
			setParticipationsInLocalStorage({
				DummyTest: { variant: 'variant' },
			});

			expect(
				isInVariantSynchronous(concurrentTests[0], 'variant'),
			).toEqual(true);

			expect(
				isInVariantSynchronous(concurrentTests[1], 'control'),
			).toEqual(true);

			expect(
				isInVariantSynchronous(concurrentTests[2], 'variant'),
			).toEqual(false);

			expect(
				isInVariantSynchronous(concurrentTests[1], 'variant'),
			).toEqual(false);
		});
	});
});
