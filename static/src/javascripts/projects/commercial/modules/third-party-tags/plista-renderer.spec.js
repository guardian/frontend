// @flow
import { init as initPlistaRenderer } from 'commercial/modules/third-party-tags/plista-renderer';
import { plista as _plista } from 'commercial/modules/third-party-tags/plista';
import config from 'lib/config';

jest.mock('commercial/modules/dfp/track-ad-render', () => ({
    trackAdRender: jest.fn(),
}));

jest.mock('common/modules/commercial/commercial-features', () => ({
    commercialFeatures: {
        thirdPartyTags: true
    },
}));

jest.mock('common/modules/experiments/ab', () => ({
    isInVariantSynchronous: jest.fn(
        (testId, variantId) => variantId === 'notintest'
    ),
}));

jest.mock('lib/load-script', () => ({ loadScript: jest.fn() }));

const plista = _plista;

jest.mock('commercial/modules/third-party-tags/plista', () => ({
    plista: {
        init: jest.fn(),
    },
}));

afterAll(() => {
    jest.resetAllMocks();
});

describe('Plista renderer', () => {
    it('should pick Plista for AU', done => {
        config.set('switches.plistaAu', true);
        config.set('page.edition', 'AU');
        initPlistaRenderer().then(() => {
            expect(plista.init).toHaveBeenCalled();
            done();
        });
    });
});
