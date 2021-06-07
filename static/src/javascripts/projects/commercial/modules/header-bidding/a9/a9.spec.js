import {
    getConsentFor as getConsentFor_,
    onConsentChange as onConsentChange_,
} from '@guardian/consent-management-platform';
import a9, { _ } from './a9';

const onConsentChange = onConsentChange_;

const tcfv2WithConsentMock = (callback) =>
    callback({
        tcfv2: { vendorConsents: { '5edf9a821dc4e95986b66df4': true } },
    });

const CcpaWithConsentMock = (callback) =>
    callback({ ccpa: { doNotSell: false } });

const getConsentFor = getConsentFor_;

jest.mock('../../../../../lib/raven');
jest.mock('../../dfp/Advert', () =>
    jest.fn().mockImplementation(() => ({ advert: jest.fn() }))
);

jest.mock('../slot-config', () => ({
    slots: jest
        .fn()
        .mockImplementation(() => [
            { key: 'top-above-nav', sizes: [[970, 250], [728, 90]] },
        ]),
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
        setDisplayBids: jest.fn(),
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
