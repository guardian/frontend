// @flow

import a9 from 'commercial/modules/header-bidding/a9/a9';
import { onIabConsentNotification as onIabConsentNotification_ } from "@guardian/consent-management-platform";

const onIabConsentNotification: any = onIabConsentNotification_;

const trueConsentMock = (callback): void =>
    callback({ '1': true, '2': true, '3': true, '4': true, '5': true });

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
    it('should generate initialise A9 library', () => {
        onIabConsentNotification.mockImplementation(trueConsentMock);
        a9.initialise();
        expect(window.apstag).toBeDefined();
        expect(window.apstag.init).toHaveBeenCalled();
    });
});
