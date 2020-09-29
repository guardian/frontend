

import { enableLazyLoad } from "commercial/modules/dfp/lazy-load";
import { getAdvertById as getAdvertById_ } from "commercial/modules/dfp/get-advert-by-id";
import { loadAdvert } from "commercial/modules/dfp/load-advert";
import { dfpEnv } from "commercial/modules/dfp/dfp-env";

jest.mock('common/modules/experiments/ab', () => ({
  isInVariantSynchronous: jest.fn()
}));

jest.mock('lib/config', () => ({
  get: jest.fn(() => false)
}));

jest.mock('commercial/modules/dfp/Advert', () => jest.fn(() => ({ advert: jest.fn() })));

jest.mock('commercial/modules/dfp/get-advert-by-id', () => ({
  getAdvertById: jest.fn()
}));

jest.mock('commercial/modules/dfp/load-advert', () => ({
  refreshAdvert: jest.fn(),
  loadAdvert: jest.fn()
}));

const getAdvertById: any = getAdvertById_;

describe('enableLazyLoad', () => {
  const windowIntersectionObserver = window.IntersectionObserver;

  const testAdvert: any = {
    id: 'test-advert',
    sizes: { desktop: [[300, 250]] },
    isRendered: false
  };

  beforeEach(() => {
    jest.resetAllMocks();
    window.IntersectionObserver = jest.fn(() => ({
      observe: jest.fn()
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

  it('should create an observer if lazyLoadObserve is true', () => {
    dfpEnv.lazyLoadObserve = true;
    enableLazyLoad(testAdvert);
    expect(loadAdvert).not.toHaveBeenCalled();
    expect(window.IntersectionObserver.mock.calls[0][1]).toEqual({
      rootMargin: '200px 0px'
    });
  });

  it('should still display the adverts if lazyLoadObserve is false', () => {
    dfpEnv.lazyLoadObserve = false;
    getAdvertById.mockReturnValue(testAdvert);
    enableLazyLoad(testAdvert);
    expect(getAdvertById.mock.calls).toEqual([['test-advert']]);
    expect(loadAdvert).toHaveBeenCalledWith(testAdvert);
  });
});