
import { loadScript } from "lib/load-script";
import { onConsentChange as onConsentChange_, getConsentFor as getConsentFor_ } from "@guardian/consent-management-platform";
import { commercialFeatures } from "common/modules/commercial/commercial-features";
import { init, _ } from "./comscore";

jest.mock('@guardian/consent-management-platform', () => ({
  onConsentChange: jest.fn(),
  getConsentFor: jest.fn()
}));

const onConsentChange: any = onConsentChange_;
const getConsentFor: any = getConsentFor_;
const SOURCEPOINT_ID = '5efefe25b8e05c06542b2a77';

const tcfv2WithConsentMock = (callback): void => callback({
  tcfv2: {
    vendorConsents: {
      [SOURCEPOINT_ID]: true
    }
  }
});
const tcfv2WithoutConsentMock = (callback): void => callback({
  tcfv2: {
    vendorConsents: {
      [SOURCEPOINT_ID]: false
    }
  }
});
const ccpaWithConsentMock = (callback): void => callback({
  ccpa: {
    doNotSell: false
  }
});
const ccpaWithoutConsentMock = (callback): void => callback({
  ccpa: {
    doNotSell: true
  }
});

jest.mock('lib/load-script', () => ({
  loadScript: jest.fn(() => Promise.resolve())
}));

jest.mock('common/modules/commercial/commercial-features', () => ({
  commercialFeatures: {
    comscore: true
  }
}));

describe('comscore init', () => {
  it('should do nothing if the comscore is disabled in commercial features', () => {
    commercialFeatures.comscore = false;
    init();

    expect(onConsentChange).not.toBeCalled();
  });

  it('should register a callback with onConsentChange if enabled in commercial features', () => {
    commercialFeatures.comscore = true;
    init();

    expect(onConsentChange).toBeCalled();
  });

  describe('Framework consent: running on consent', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      _.resetInit();
    });

    it('TCFv2 with consent: runs', () => {
      onConsentChange.mockImplementation(tcfv2WithConsentMock);
      getConsentFor.mockReturnValue(true);
      init();
      expect(loadScript).toBeCalled();
    });

    it('TCFv2 without consent: does not run', () => {
      onConsentChange.mockImplementation(tcfv2WithoutConsentMock);
      getConsentFor.mockReturnValue(false);
      init();
      expect(loadScript).not.toBeCalled();
    });
    it('CCPA with consent: runs', () => {
      onConsentChange.mockImplementation(ccpaWithConsentMock);
      init();
      expect(loadScript).toBeCalled();
    });

    it('CCPA without consent: runs', () => {
      onConsentChange.mockImplementation(ccpaWithoutConsentMock);
      init();
      expect(loadScript).toBeCalled();
    });
  });
});

describe('comscore initOnConsent', () => {
  it('should call loadScript with the expected parameters', () => {
    _.initOnConsent(true);

    expect(loadScript).toBeCalledWith(_.comscoreSrc, {
      id: 'comscore',
      async: true
    });
  });

  it('should call loadScript exactly once regardless of how many times it runs', () => {
    _.initOnConsent(true);
    _.initOnConsent(true);
    _.initOnConsent(true);

    // $FlowFixMe
    expect(loadScript).toBeCalledTimes(1);
  });
});

describe('comscore getGlobals', () => {
  it('return an object with the c1 and c2 properties correctly set when called with "Network Front" as keywords', () => {
    const expectedGlobals = { c1: _.comscoreC1, c2: _.comscoreC2 };
    expect(_.getGlobals(true, 'Network Front')).toMatchObject(expectedGlobals);
  });

  it('return an object with the c1 and c2 properties correctly set when called with non-"Network Front" as keywords', () => {
    const expectedGlobals = { c1: _.comscoreC1, c2: _.comscoreC2 };
    expect(_.getGlobals(true, '')).toMatchObject(expectedGlobals);
  });

  it('returns an object with no comscorekw variable set when called with "Network Front" as keywords', () => {
    const comscoreGlobals = Object.keys(_.getGlobals(true, 'Network Front'));
    expect(comscoreGlobals).not.toContain('comscorekw');
  });

  it('returns an object with the correct comscorekw variable set when called with "Network Front" as keywords', () => {
    const keywords = 'These are the best keywords. The greatest!';

    expect(_.getGlobals(true, keywords)).toMatchObject({
      comscorekw: keywords
    });
  });

  it('returns an object with the correct cs_ucfr variable set when calleed with consent sate as true', () => {
    expect(_.getGlobals(true, '')).toMatchObject({
      cs_ucfr: '1'
    });
  });

  it('returns an object with the correct cs_ucfr variable set when calleed with consent sate as false', () => {
    expect(_.getGlobals(false, '')).toMatchObject({
      cs_ucfr: '0'
    });
  });
});