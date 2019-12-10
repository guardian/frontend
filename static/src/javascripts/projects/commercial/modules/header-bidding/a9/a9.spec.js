// @flow

import a9 from 'commercial/modules/header-bidding/a9/a9';

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
        a9.initialise();
        expect(window.apstag).toBeDefined();
        expect(window.apstag.init).toHaveBeenCalled();
    });
});
