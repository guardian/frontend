import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import type { Advert } from './Advert';
import { dfpEnv } from './dfp-env';
import { getAdvertById } from './get-advert-by-id';
import { enableLazyLoad } from './lazy-load';
import { loadAdvert } from './load-advert';

jest.mock('lodash-es', () => ({
	...jest.requireActual('lodash-es'),
	// Mock `once` as the identity function so we can re-run `enableLazyLoad`
	// and generate different intersection observers
	once: jest.fn().mockImplementation(<T>(f: T) => f),
}));

jest.mock('../../../common/modules/experiments/ab', () => ({
	isInVariantSynchronous: jest.fn(),
}));

jest.mock('../../../../lib/config', () => ({
	get: jest.fn(() => false),
}));

jest.mock('./Advert', () => jest.fn(() => ({ advert: jest.fn() })));

jest.mock('./get-advert-by-id');

jest.mock('./load-advert', () => ({
	loadAdvert: jest.fn(),
}));

describe('enableLazyLoad', () => {
	const windowIntersectionObserver = window.IntersectionObserver;

	const testAdvert = {
		id: 'test-advert',
		sizes: { desktop: [[300, 250]] },
		isRendered: false,
	};

	beforeEach(() => {
		jest.resetAllMocks();
		(window.IntersectionObserver as jest.Mock) = jest.fn(() => ({
			observe: jest.fn(),
		}));

		expect.hasAssertions();
	});

	afterAll(() => {
		window.IntersectionObserver = windowIntersectionObserver;
	});

	test('JSDOM and Jest should not have an intersectionObserver', () => {
		// META TEST! Are the assumptions about Jest and JSDOM correct?
		expect(windowIntersectionObserver).toBe(undefined);
	});

	it('should create a 20% observer if lazyLoadObserve is true and not in control of commercialEndOfQuarter2Test', () => {
		// Mock being in variant / not in test
		(isInVariantSynchronous as jest.Mock).mockReturnValue(false);
		dfpEnv.lazyLoadObserve = true;
		enableLazyLoad(testAdvert as unknown as Advert);
		expect(loadAdvert).not.toHaveBeenCalled();
		expect(
			window.IntersectionObserver as jest.Mock,
		).toHaveBeenNthCalledWith(1, expect.anything(), {
			rootMargin: '20% 0px',
		});
	});

	it('should create a 200px observer if lazyLoadObserve is true and in control of commercialEndOfQuarter2Test', () => {
		// Mock being in control of test
		(isInVariantSynchronous as jest.Mock).mockReturnValueOnce(true);
		dfpEnv.lazyLoadObserve = true;
		enableLazyLoad(testAdvert as unknown as Advert);
		expect(loadAdvert).not.toHaveBeenCalled();
		expect(
			window.IntersectionObserver as jest.Mock,
		).toHaveBeenNthCalledWith(1, expect.anything(), {
			rootMargin: '200px 0px',
		});
	});

	it('should create a 0% observer if lazyLoadObserve is true and not in control of commercialEndOfQuarter2Test and in variant-1 of commercialLazyLoadMarginReloaded', () => {
		// Mock being in variant / not in test
		(isInVariantSynchronous as jest.Mock)
			.mockReturnValueOnce(false)
			.mockReturnValueOnce(true);
		dfpEnv.lazyLoadObserve = true;
		enableLazyLoad(testAdvert as unknown as Advert);
		expect(loadAdvert).not.toHaveBeenCalled();
		expect(
			window.IntersectionObserver as jest.Mock,
		).toHaveBeenNthCalledWith(1, expect.anything(), {
			rootMargin: '0% 0px',
		});
	});

	it('should still display the adverts if lazyLoadObserve is false', () => {
		dfpEnv.lazyLoadObserve = false;
		(getAdvertById as jest.Mock).mockReturnValue(testAdvert);
		enableLazyLoad(testAdvert as unknown as Advert);
		expect((getAdvertById as jest.Mock).mock.calls).toEqual([
			['test-advert'],
		]);
		expect(loadAdvert).toHaveBeenCalledWith(testAdvert);
	});
});
