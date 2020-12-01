
import { signInGate } from "./index";

jest.mock('ophan/ng', () => ({
  record: jest.fn()
}));

jest.mock('common/modules/experiments/ab', () => ({
  isInABTestSynchronous: jest.fn(() => true),
  getAsyncTestsToRun: jest.fn(() => Promise.resolve([])),
  getSynchronousTestsToRun: jest.fn(() => [{
    id: 'SignInGateMainVariant', // Update for each new test
    dataLinkNames: 'SignInGateMain', // Update for each new test
    variantToRun: {
      id: 'main-variant-3' // Update for each new test
    },
    ophanComponentId: 'main_test'
  }])
}));

jest.mock('@guardian/libs', () => ({
  storage: {
    local: {
      get: jest.fn(() => [{ count: 2, day: 1 }])
    }
  }
}));

jest.mock('common/modules/identity/api', () => ({
  isUserLoggedIn: jest.fn(() => false)
}));

jest.mock('lib/config', () => ({
  get: jest.fn(() => false)
}));

jest.mock('common/modules/user-prefs', () => ({
  get: jest.fn(() => undefined)
}));

jest.mock('common/modules/ui/cmp-ui', () => ({
  get: jest.fn(() => undefined)
}));

jest.mock('@guardian/consent-management-platform', () => ({
  get: jest.fn(() => undefined)
}));

jest.mock('lib/cookies', () => ({
  getCookie: jest.fn(() => '')
}));

const fakeIsInABTestSynchronous: any = require('common/modules/experiments/ab').isInABTestSynchronous;

const fakeLocal: any = require('@guardian/libs').storage.local;

const fakeIsUserLoggedIn: any = require('common/modules/identity/api').isUserLoggedIn;

const fakeConfig: any = require('lib/config');

const fakeUserPrefs: any = require('common/modules/user-prefs');

describe('Sign in gate test', () => {
  // making a backup of the navigator method
  const {
    navigator
  } = window;

  beforeEach(() => {
    delete window.navigator;
    window.navigator = {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36'
    };
  });

  afterEach(() => {
    window.navigator = navigator;
  });

  describe('canShow returns true', () => {
    it('should return true using default mocks', () => {
      // Add a fake default config.get call for the keywordIds
      fakeConfig.get.mockReturnValueOnce("");
      signInGate.canShow().then(show => {
        expect(show).toBe(true);
      });
    });

    it('should return true if page view is greater than or equal to 2', () => {
      fakeLocal.get.mockReturnValueOnce([{ count: 10, day: 1 }]);
      signInGate.canShow().then(show => {
        expect(show).toBe(true);
      });
    });
  });

  describe('canShow returns false', () => {
    it('should return false if not in correct test', () => {
      fakeIsInABTestSynchronous.mockReturnValue(false);
      return signInGate.canShow().then(show => {
        expect(show).toBe(false);
      });
    });

    it('should return false if this is the first page view', () => {
      fakeLocal.get.mockReturnValueOnce([{ count: 0, day: 1 }]);
      return signInGate.canShow().then(show => {
        expect(show).toBe(false);
      });
    });

    it('should return false of the dailyArticleCount does not exist', () => {
      fakeLocal.get.mockReturnValueOnce(undefined);
      return signInGate.canShow().then(show => {
        expect(show).toBe(false);
      });
    });

    it('should return false if user has dismissed the gate', () => {
      fakeUserPrefs.get.mockReturnValueOnce({
        'SignInGateMain-main-variant-2': Date.now()
      });
      return signInGate.canShow().then(show => {
        expect(show).toBe(false);
      });
    });

    it('should return false if the user is logged in', () => {
      fakeIsUserLoggedIn.mockReturnValueOnce(true);
      return signInGate.canShow().then(show => {
        expect(show).toBe(false);
      });
    });

    it('should return false if there is an invalid article type or section detected', () => {
      fakeConfig.get.mockReturnValueOnce(true);
      return signInGate.canShow().then(show => {
        expect(show).toBe(false);
      });
    });

    it('should return false if its an ios 9 device', () => {
      window.navigator.userAgent = 'Mozilla/5.0 (iPad; CPU OS 9_1 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) CriOS/46.0.2490.73 Mobile/13C143 Safari/600.1.4 (000718)';
      return signInGate.canShow().then(show => {
        expect(show).toBe(false);
      });
    });

    it('should return false if its a newsletter landing page', () => {
      fakeConfig.get.mockReturnValueOnce("info/newsletter-sign-up,us-news/us-news,society/homelessness,society/housing");
      return signInGate.canShow().then(show => {
        expect(show).toBe(false);
      });
    });
  });
});