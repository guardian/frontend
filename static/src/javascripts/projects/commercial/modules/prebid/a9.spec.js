// @flow

import a9 from 'commercial/modules/prebid/a9';
import _a9lib from 'lib/apstag';

jest.mock('lib/raven');
jest.mock('lib/apstag', () => ({
    init: jest.fn(),
    fetchBids: jest.fn(),
    setDisplayBids: jest.fn(),
}));
jest.mock('common/modules/experiments/ab', () => ({
    isInVariantSynchronous: jest.fn(),
}));

const a9lib = _a9lib;

jest.mock('commercial/modules/dfp/Advert', () =>
    jest.fn().mockImplementation(() => ({ advert: jest.fn() }))
);

beforeEach(async () => {
    jest.resetModules();
    window.apstag = a9lib;
});

describe('initialise', () => {
    test('should generate correct A9 config when all switches on', () => {
        a9.initialise();
        expect(window.apstag).toBeDefined();
        expect(a9lib.init).toHaveBeenCalled();
    });

    test('should request bids', () => {
        a9.initialise();
        a9.requestBids().then(() => {
            expect(a9lib.fetchBids).toHaveBeenCalledWith();
            done();
        });
    });
});
