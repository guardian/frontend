// @flow

import a9 from 'commercial/modules/prebid/a9';
import _a9lib from 'lib/apstag';

jest.mock('lib/raven');
jest.mock('lib/apstag', () => ({
    init: () => {},
    fetchBids: () => {},
    setDisplayBids: () => {},
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
    });
});
