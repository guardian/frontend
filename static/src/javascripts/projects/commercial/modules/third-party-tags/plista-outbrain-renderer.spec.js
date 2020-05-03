// @flow
import { init as initPlistaOutbrainRenderer } from 'commercial/modules/third-party-tags/plista-outbrain-renderer';
import { initOutbrain as _initOutbrain } from 'commercial/modules/third-party-tags/outbrain';
import { plista as _plista } from 'commercial/modules/third-party-tags/plista';
import config from 'lib/config';

jest.mock('commercial/modules/dfp/track-ad-render', () => ({
    trackAdRender: jest.fn(),
}));

jest.mock('common/modules/commercial/commercial-features', () => ({
    commercialFeatures: {
        thirdPartyTags: true,
        outbrain: true,
    },
}));

jest.mock('common/modules/experiments/ab', () => ({
    isInVariantSynchronous: jest.fn(
        (testId, variantId) => variantId === 'notintest'
    ),
}));

jest.mock('lib/load-script', () => ({ loadScript: jest.fn() }));

const plista = _plista;
const initOutbrain = _initOutbrain;

jest.mock('commercial/modules/third-party-tags/plista', () => ({
    plista: {
        init: jest.fn(),
    },
}));

jest.mock('commercial/modules/third-party-tags/outbrain', () => ({
    initOutbrain: jest.fn(),
}));

afterAll(() => {
    jest.resetAllMocks();
});

describe('Plista Outbrain renderer', () => {
    it('should display Outbrain for UK, US and International Edition', done => {
        ['uk', 'us', 'int'].forEach((edition, index) => {
            config.set('switches.plistaForOutbrainAu', true);
            config.set('page.edition', edition);
            initPlistaOutbrainRenderer().then(() => {
                expect(initOutbrain).toHaveBeenCalled();
                if (index === 2) {
                    done();
                }
            });
        });
    });

    it('should pick Plista for AU', done => {
        config.set('switches.plistaForOutbrainAu', true);
        config.set('page.edition', 'AU');
        initPlistaOutbrainRenderer().then(() => {
            expect(plista.init).toHaveBeenCalled();
            done();
        });
    });
});
