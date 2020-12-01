
import qwery from "qwery";
import fakeConfig from "lib/config";
import fakeMediator from "lib/mediator";
import fastdom from "lib/fastdom-promise";
import { init } from "commercial/modules/article-aside-adverts";

jest.mock('common/modules/commercial/commercial-features', () => ({
  commercialFeatures: {
    articleAsideAdverts: true
  }
}));

const fastdomMeasureSpy = jest.spyOn(fastdom, 'measure');

const sharedBeforeEach = (domSnippet: string) => () => {
  jest.resetAllMocks();
  fakeMediator.removeAllListeners();
  fakeConfig.page.isImmersive = false;
  fakeConfig.page.hasShowcaseMainElement = false;

  if (document.body) {
    document.body.innerHTML = domSnippet;
  }
  expect.hasAssertions();
};

const sharedAfterEach = () => {
  if (document.body) {
    document.body.innerHTML = '';
  }
};

describe('Standard Article Aside Adverts', () => {
  const domSnippet = `
        <div class="js-content-main-column"></div>
        <div class="content__secondary-column js-secondary-column">
            <div class="aside-slot-container js-aside-slot-container">
                <div id="dfp-ad--right" class="js-ad-slot ad-slot ad-slot--right ad-slot--mpu-banner-ad js-sticky-mpu ad-slot--rendered" data-link-name="ad slot right" data-name="right" data-mobile="1,1|2,2|300,250|300,274|300,600|fluid"></div>
            </div>
        </div>
    `;

  beforeEach(sharedBeforeEach(domSnippet));
  afterEach(sharedAfterEach);

  it('should exist', () => {
    expect(init).toBeDefined();
    expect(qwery('.ad-slot').length).toBe(1);
  });

  it('should resolve immediately if the secondary column does not exist', done => {
    if (document.body) {
      document.body.innerHTML = `<div class="js-content-main-column"></div>`;
    }

    init().then(resolve => {
      expect(resolve).toBe(false);
      done();
    });
  });

  it('should have the correct size mappings and classes', done => {
    fastdomMeasureSpy.mockReturnValue(Promise.resolve([2000, 0]));
    fakeMediator.once('page:defaultcommercial:right', adSlot => {
      expect(adSlot.classList).toContain('js-sticky-mpu');
      expect(adSlot.getAttribute('data-mobile')).toBe('1,1|2,2|300,250|300,274|300,600|fluid');
      done();
    });
    init();
  });

  it('should mutate the ad slot in short articles', done => {
    fastdomMeasureSpy.mockReturnValue(Promise.resolve([10, 0]));
    fakeMediator.once('page:defaultcommercial:right', adSlot => {
      expect(adSlot.classList).not.toContain('js-sticky-mpu');
      expect(adSlot.getAttribute('data-mobile')).toBe('1,1|2,2|300,250|300,274|fluid');
      done();
    });
    init();
  });
});

describe('Immersive Article Aside Adverts', () => {
  const domSnippet = `
        <div class="js-content-main-column">
            <figure class="element element--immersive"></figure>
            <figure class="element element--immersive"></figure>
        </div>
        <div class="content__secondary-column js-secondary-column">
            <div class="aside-slot-container js-aside-slot-container">
                <div id="dfp-ad--right" class="js-ad-slot ad-slot ad-slot--right ad-slot--mpu-banner-ad js-sticky-mpu ad-slot--rendered" data-link-name="ad slot right" data-name="right" data-mobile="1,1|2,2|300,250|300,274|300,600|fluid"></div>
            </div>
        </div>
    `;
  beforeEach(sharedBeforeEach(domSnippet));
  afterEach(sharedAfterEach);

  it('should have correct test elements', () => {
    expect(qwery('.js-content-main-column .element--immersive').length).toBe(2);
  });

  it('should remove sticky and return all slot sizes when there is enough space', done => {
    fastdomMeasureSpy.mockReturnValueOnce(Promise.resolve([900001, 10000]));
    fakeConfig.page.isImmersive = true;

    fakeMediator.once('page:defaultcommercial:right', adSlot => {
      expect(adSlot.classList).not.toContain('js-sticky-mpu');
      const sizes = adSlot.getAttribute('data-mobile').split('|');
      expect(sizes).toContain('1,1');
      expect(sizes).toContain('2,2');
      expect(sizes).toContain('300,250');
      expect(sizes).toContain('300,274');
      expect(sizes).toContain('300,600');
      expect(sizes).toContain('fluid');
      done();
    });
    init();
  });

  it('should remove sticky and return sizes that will fit when there is limited space', done => {
    fastdomMeasureSpy.mockReturnValueOnce(Promise.resolve([900002, 260]));
    fakeConfig.page.isImmersive = true;

    fakeMediator.once('page:defaultcommercial:right', adSlot => {
      expect(adSlot.classList).not.toContain('js-sticky-mpu');
      const sizes = adSlot.getAttribute('data-mobile').split('|');
      expect(sizes).toContain('1,1');
      expect(sizes).toContain('2,2');
      expect(sizes).toContain('300,250');
      expect(sizes).not.toContain('300,274');
      expect(sizes).not.toContain('300,600');
      expect(sizes).not.toContain('fluid');
      done();
    });
    init();
  });
});

describe('Immersive Article (no immersive elements) Aside Adverts', () => {
  const domSnippet = `
        <div class="js-content-main-column"></div>
        <div class="content__secondary-column js-secondary-column">
            <div class="aside-slot-container js-aside-slot-container">
                <div id="dfp-ad--right" class="js-ad-slot ad-slot ad-slot--right ad-slot--mpu-banner-ad js-sticky-mpu ad-slot--rendered" data-link-name="ad slot right" data-name="right" data-mobile="1,1|2,2|300,250|300,274|300,600|fluid"></div>
            </div>
        </div>
    `;
  beforeEach(sharedBeforeEach(domSnippet));
  afterEach(sharedAfterEach);

  it('should have the correct size mappings and classes (leaves it untouched)', done => {
    fastdomMeasureSpy.mockReturnValue(Promise.resolve([900000, 0]));
    fakeConfig.page.isImmersive = true;

    fakeMediator.once('page:defaultcommercial:right', adSlot => {
      expect(adSlot.classList).toContain('js-sticky-mpu');
      expect(adSlot.getAttribute('data-mobile')).toBe('1,1|2,2|300,250|300,274|300,600|fluid');
      done();
    });
    init();
  });
});