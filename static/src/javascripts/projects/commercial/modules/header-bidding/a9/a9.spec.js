// @flow

import a9, { _ } from 'commercial/modules/header-bidding/a9/a9';
import { oldCmp as oldCmp_, onConsentChange as onConsentChange_ } from '@guardian/consent-management-platform';
import { isInTcfv2Test as isInTcfv2Test_} from 'commercial/modules/cmp/tcfv2-test';

const oldCmp: any = oldCmp_;
const isInTcfv2Test: any = isInTcfv2Test_;
const onConsentChange: any = onConsentChange_;

const TcfWithConsentMock = (callback): void =>
    callback({ '1': true, '2': true, '3': true, '4': true, '5': true });

const tcfv2WithConsentMock = (callback): void =>
    callback({ tcfv2 : { customVendors: { grants: { '5edf9a821dc4e95986b66df4': { vendorGrant: true }}}}});

const CcpaWithConsentMock = (callback): void => callback(false);

jest.mock('lib/raven');
jest.mock('commercial/modules/dfp/Advert', () =>
    jest.fn().mockImplementation(() => ({ advert: jest.fn() }))
);

jest.mock('commercial/modules/cmp/tcfv2-test', () => ({
    isInTcfv2Test: jest
        .fn(),
}));

jest.mock('commercial/modules/header-bidding/slot-config', () => ({
    slots: jest
        .fn()
        .mockImplementation(() => [
            { key: 'top-above-nav', sizes: [[970, 250], [728, 90]] },
        ]),
}));

jest.mock('@guardian/consent-management-platform', () => ({
    oldCmp: {
        onIabConsentNotification: jest.fn()
    },
    onConsentChange: jest.fn()
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
    it('should generate initialise A9 library when TCF consent has been given', () => {
        oldCmp.onIabConsentNotification.mockImplementation(TcfWithConsentMock);
        a9.initialise();
        expect(window.apstag).toBeDefined();
        expect(window.apstag.init).toHaveBeenCalled();
    });

    it('should generate initialise A9 library when TCFv2 consent has been given', () => {
        isInTcfv2Test.mockImplementation(() => true);
        onConsentChange.mockImplementation(tcfv2WithConsentMock);
        a9.initialise();
        expect(window.apstag).toBeDefined();
        expect(window.apstag.init).toHaveBeenCalled();
    });

    it('should generate initialise A9 library when CCPA consent has been given', () => {
        oldCmp.onIabConsentNotification.mockImplementation(CcpaWithConsentMock);
        a9.initialise();
        expect(window.apstag).toBeDefined();
        expect(window.apstag.init).toHaveBeenCalled();
    });
});
