// @flow

import a9, { _ } from 'commercial/modules/header-bidding/a9/a9';
import { onIabConsentNotification as onIabConsentNotification_ } from '@guardian/consent-management-platform';
import config from 'lib/config';

const onIabConsentNotification: any = onIabConsentNotification_;

const TcfWithConsentMockYes = (callback): void =>
    callback({ '1': true, '2': true, '3': true, '4': true, '5': true });
const TcfWithConsentMockNo = (callback): void =>
    callback({ '1': true, '2': true, '3': true, '4': true, '5': false });



const CcpaWithConsentMockNo = (callback): void => callback(false);
const CcpaWithConsentMockYes = (callback): void => callback(true);

jest.mock('lib/raven');
jest.mock('commercial/modules/dfp/Advert', () =>
    jest.fn().mockImplementation(() => ({ advert: jest.fn() }))
);

jest.mock('commercial/modules/header-bidding/slot-config', () => ({
    slots: jest
        .fn()
        .mockImplementation(() => [
            { key: 'top-above-nav', sizes: [[970, 250], [728, 90]] },
        ]),
}));

jest.mock('@guardian/consent-management-platform', () => ({
    onIabConsentNotification: jest.fn(),
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
        onIabConsentNotification.mockImplementation(TcfWithConsentMockYes);
        config.set('page.a9PublisherId', 123)
        a9.initialise();
        expect(window.apstag).toBeDefined();
        expect(window.apstag.init).toHaveBeenCalledWith({
            pubID: 123,
            adServer: 'googletag',
            bidTimeout: 1500,
        });
    });

    it('should not generate initialise A9 library when TCF consent has not been given', () => {
        onIabConsentNotification.mockImplementation(TcfWithConsentMockNo);
        config.set('page.a9PublisherId', 123)
        a9.initialise();
        expect(window.apstag.init).not.toHaveBeenCalled();
    });

    it('should generate initialise A9 library when CCPA consent has been given to not share data', () => {
        onIabConsentNotification.mockImplementation(CcpaWithConsentMockNo);
        a9.initialise();
        expect(window.apstag).toBeDefined();
        expect(window.apstag.init).toHaveBeenCalledWith({
            pubID: 123,
            adServer: 'googletag',
            bidTimeout: 1500,
            us_privacy: '1YNN'
        });
    });

    it('should generate initialise A9 library when CCPA consent has been given to share data', () => {
        onIabConsentNotification.mockImplementation(CcpaWithConsentMockYes);
        a9.initialise();
        expect(window.apstag).toBeDefined();
        expect(window.apstag.init).toHaveBeenCalledWith({
            pubID: 123,
            adServer: 'googletag',
            bidTimeout: 1500,
            us_privacy: '1YYN'
        });
    });
});
