
import { _, Advert } from "commercial/modules/dfp/Advert";

const {
  filterClasses
} = _;

jest.mock('lib/raven');
jest.mock('ophan/ng', () => null);

describe('Filter classes', () => {
  it('should return nil for empty class lists', () => {
    const result = filterClasses([], []);
    expect(result.length).toBe(0);
  });

  it('should return one class to be removed', () => {
    const result = filterClasses(['old-class'], []);
    expect(result.length).toBe(1);
    expect(result).toContain('old-class');
  });

  it('should return nil classes to be removed', () => {
    const result = filterClasses([], ['new-class']);
    expect(result.length).toBe(0);
  });

  it('should remove two unused classes', () => {
    const result = filterClasses(['old-class', 'old-class-2', 'old-class-3'], ['old-class-2']);
    expect(result.length).toBe(2);
    expect(result).toContain('old-class');
    expect(result).toContain('old-class-3');
  });
});

describe('Advert', () => {
  beforeEach(() => {
    const sizeMapping = {
      sizes: [],
      build: jest.fn(() => [])
    };
    window.googletag = {
      pubads() {
        return {};
      },
      sizeMapping() {
        return sizeMapping;
      },
      defineSlot: jest.fn(() => window.googletag),
      addService: jest.fn(() => window.googletag),
      defineSizeMapping: jest.fn(() => window.googletag),
      setTargeting: jest.fn(() => window.googletag),
      setSafeFrameConfig: jest.fn(() => window.googletag)
    };
  });

  it('should enable safeframe to expand in the top-above-nav slot', () => {
    const slot = document.createElement('div');
    slot.setAttribute('data-name', 'top-above-nav');
    const ad = new Advert(slot);
    expect(ad).toBeDefined();
    expect(window.googletag.setSafeFrameConfig).toBeCalledWith({
      allowOverlayExpansion: false,
      allowPushExpansion: true,
      sandbox: true
    });
  });

  it('should enable safeframe to expand in the inline1 slot', () => {
    const slot = document.createElement('div');
    slot.setAttribute('data-name', 'inline1');
    const ad = new Advert(slot);
    expect(ad).toBeDefined();
    expect(window.googletag.setSafeFrameConfig).toBeCalledWith({
      allowOverlayExpansion: false,
      allowPushExpansion: true,
      sandbox: true
    });
  });

  it('should not enable safeframe to expand in a slot that cannot take outstream ads', () => {
    const slot = document.createElement('div');
    slot.setAttribute('data-name', 'inline2');
    const ad = new Advert(slot);
    expect(ad).toBeDefined();
    expect(window.googletag.setSafeFrameConfig).not.toBeCalled();
  });
});