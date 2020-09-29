

import config from "lib/config";
import { commercialFeatures } from "common/modules/commercial/commercial-features";
import { related } from "./related";

jest.mock('lib/config');
jest.mock('common/modules/commercial/commercial-features', () => ({
  commercialFeatures() {}
}));
jest.mock('common/modules/ui/expandable', () => ({
  Expandable: jest.fn()
}));
jest.mock('common/modules/analytics/register', () => ({
  begin() {},
  end() {},
  error() {}
}));

const FakeExp: any = require('common/modules/ui/expandable').Expandable;

describe('onward/related', () => {
  beforeEach(() => {
    if (document.body) {
      document.body.innerHTML = `
                <div class="js-related lazyloaded"></div>
                <div class="related-trails"></div>
            `;
    }

    config.page = {
      hasStoryPackage: false,
      showRelatedContent: true
    };
    config.switches = {
      relatedContent: true,
      ajaxRelatedContent: true
    };

    FakeExp.mockReset();
    FakeExp.prototype.init = jest.fn();

    jest.resetAllMocks();
    jest.resetModules();
  });

  afterEach(() => {
    FakeExp.prototype.init.mockRestore();
  });

  it("should hide if there's no story package and related can't be fetched", () => {
    const container: HTMLElement = (document.querySelector('.js-related'));

    config.switches.relatedContent = false;

    related({});

    expect(container.classList.contains('u-h')).toBe(true);
  });

  it('should hide if user has ad-free and the page is paid content', () => {
    const container: HTMLElement = (document.querySelector('.js-related'));

    config.page.isPaidContent = true;
    commercialFeatures.adFree = true;

    related({});

    expect(container.classList.contains('u-h')).toBe(true);
  });

  it('should create expandable if page has story package', () => {
    config.page.hasStoryPackage = true;

    related({});

    expect(FakeExp).toHaveBeenCalledWith({
      dom: document.querySelector('.related-trails'),
      expanded: false,
      showCount: false
    });
  });
});