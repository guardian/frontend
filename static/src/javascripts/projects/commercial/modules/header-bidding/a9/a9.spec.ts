

import a9, { _ } from "commercial/modules/header-bidding/a9/a9";
import { onConsentChange as onConsentChange_, getConsentFor as getConsentFor_ } from "@guardian/consent-management-platform";

const onConsentChange: any = onConsentChange_;

const tcfv2WithConsentMock = (callback): void => callback({
  tcfv2: { vendorConsents: { '5edf9a821dc4e95986b66df4': true } }
});

const CcpaWithConsentMock = (callback): void => callback({ ccpa: { doNotSell: false } });

const getConsentFor: any = getConsentFor_;

jest.mock('lib/raven');
jest.mock('commercial/modules/dfp/Advert', () => jest.fn().mockImplementation(() => ({ advert: jest.fn() })));

jest.mock('commercial/modules/header-bidding/slot-config', () => ({
  slots: jest.fn().mockImplementation(() => [{ key: 'top-above-nav', sizes: [[970, 250], [728, 90]] }])
}));

jest.mock('@guardian/consent-management-platform', () => ({
  onConsentChange: jest.fn(),
  getConsentFor: jest.fn()
}));

beforeEach(async () => {
  jest.resetModules();
  _.resetModule();
  window.apstag = {
    init: jest.fn(),
    fetchBids: jest.fn().mockImplementation(() => Promise.resolve([])),
    setDisplayBids: jest.fn()
  };
});

afterAll(() => {
  jest.resetAllMocks();
});

describe('initialise', () => {
  it('should generate initialise A9 library when TCFv2 consent has been given', () => {
    onConsentChange.mockImplementation(tcfv2WithConsentMock);
    getConsentFor.mockReturnValue(true);
    a9.initialise();
    expect(window.apstag).toBeDefined();
    expect(window.apstag.init).toHaveBeenCalled();
  });

  it('should generate initialise A9 library when CCPA consent has been given', () => {
    onConsentChange.mockImplementation(CcpaWithConsentMock);
    getConsentFor.mockReturnValue(true);
    a9.initialise();
    expect(window.apstag).toBeDefined();
    expect(window.apstag.init).toHaveBeenCalled();
  });
});