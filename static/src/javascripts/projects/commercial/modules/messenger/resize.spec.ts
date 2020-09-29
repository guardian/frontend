
import { JestMockT } from "jest";
import { _ } from "./resize";

const {
  normalise,
  resize
} = _;

const foolFlow = (mockFn: any) => ((mockFn) as JestMockT);

describe('Cross-frame messenger: resize', () => {
  beforeEach(() => {
    if (document.body) {
      document.body.innerHTML = `
              <div id="slot01" class="js-ad-slot" style="width: 7px; height: 14px;" >
                <div id="container01">
                    <div id="iframe01" class="iframe" data-unit="ch"></div>
                </div>
              </div>`;
    }
    expect.hasAssertions();
  });

  afterEach(() => {
    if (document.body) {
      document.body.innerHTML = '';
    }
  });

  describe('normalise function', () => {
    it('should normalise the length passed in', () => {
      expect(normalise('300')).toBe('300px');
      expect(normalise('600px')).toBe('600px');
      expect(normalise('900??')).toBe('900px');
    });

    it('should accept all relative units', () => {
      const units = ['ch', 'px', 'em', 'rem', 'vmin', 'vmax', 'vh', 'vw', 'ex'];
      units.forEach(unit => {
        expect(normalise(`10${unit}`)).toBe(`10${unit}`);
      });
    });
  });

  describe('resize function', () => {
    it('should resolve if the specs are empty', () => {
      const fakeAdSlot = document.createElement('div');
      const fakeIframeContainer = document.createElement('div');
      const fakeIframe = document.createElement('iframe');
      const result = resize({}, fakeIframe, fakeIframeContainer, fakeAdSlot);
      expect(result).toBeNull();
    });

    it('should set width and height of the iFrame and leave ad slot unchanged', () => {
      const fallback = document.createElement('div');
      const fakeIframeContainer = document.getElementById('container01') || fallback;
      const fakeIframe = document.getElementById('iframe01') || fallback;
      const fakeAdSlot = document.getElementById('slot01') || fallback;
      return foolFlow(resize({ width: '20', height: '10' }, fakeIframe, fakeIframeContainer, fakeAdSlot)).then(() => {
        expect(fakeIframe.style.height).toBe('10px');
        expect(fakeIframe.style.width).toBe('20px');
        expect(fakeAdSlot.style.height).toBe('14px');
        expect(fakeAdSlot.style.width).toBe('7px');
      });
    });
  });
});