// @flow
import { PlistaOutbrainRenderer } from 'commercial/modules/third-party-tags/plista-outbrain-renderer';
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
jest.mock('./outbrain-load', () => ({ load: jest.fn() }));

describe('Plista Outbrain renderer', () => {
    it('should display Outbrain for UK, US and International Edition', () => {
        const outbrainEditions = ['uk', 'us', 'int'];

        outbrainEditions.forEach(edition => {
            config.set('switches.plistaForOutbrainAu', true);
            config.set('page.edition', edition);
            const renderer = new PlistaOutbrainRenderer();
            const spy = jest.spyOn(renderer, 'renderWidget');
            renderer.render();
            expect(spy).toHaveBeenCalledWith('outbrain', expect.any(Function));
        });
    });

    it('should pick Outbrain for AU', () => {
        global.Math.random = () => 1;
        config.set('switches.plistaForOutbrainAu', true);
        config.set('page.edition', 'AU');
        const renderer = new PlistaOutbrainRenderer();
        const spy = jest.spyOn(renderer, 'renderWidget');
        renderer.render();
        expect(spy).toHaveBeenCalledWith('outbrain', expect.any(Function));
    });

    it('should pick Plista for AU', () => {
        global.Math.random = () => 0;
        config.set('switches.plistaForOutbrainAu', true);
        config.set('page.edition', 'AU');
        const renderer = new PlistaOutbrainRenderer();
        const spy = jest.spyOn(renderer, 'renderWidget');
        renderer.render();
        expect(spy).toHaveBeenCalledWith('plista', expect.any(Function));
    });
});
