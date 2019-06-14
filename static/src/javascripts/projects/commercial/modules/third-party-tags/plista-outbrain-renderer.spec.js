import {PlistaOutbrainRenderer} from 'commercial/modules/third-party-tags/plista-outbrain-renderer';

//these mocks are required for plista.js
jest.mock('commercial/modules/dfp/track-ad-render', () => ({
    trackAdRender: jest.fn(),
}));

jest.mock('common/modules/commercial/commercial-features', () => ({
    commercialFeatures: {
        thirdPartyTags: true,
        outbrain: true,
    },
}));

//these mocks are required for outbrain.js
jest.mock('common/modules/experiments/ab', () => ({
    isInVariantSynchronous: jest.fn(
        (testId, variantId) => variantId === 'notintest'
    ),
}));

jest.mock('lib/load-script', () => ({ loadScript: jest.fn() }));
jest.mock('./outbrain-load', () => ({ load: jest.fn() }));


jest.mock('../../../../lib/config', () => ({
    get: jest.fn().mockReturnValue(true)
}));

describe('Plista Outbrain renderer', () => {

    it('should display Outbrain for UK, US and International Edition', () => {
        let outbrainEditions = ['uk', 'us', 'int'];

        outbrainEditions.forEach(edition => {
            let renderer = new PlistaOutbrainRenderer(edition);
            const spy = jest.spyOn(renderer, 'renderWidget');
            renderer.render();
            expect(spy).toHaveBeenCalledWith('outbrain', expect.any(Function));
        })
    });

    it('should pick Outbrain for AU', () => {
        global.Math.random = () => 1;
        let renderer = new PlistaOutbrainRenderer('au');
        const spy = jest.spyOn(renderer, 'renderWidget');
        renderer.render();
        expect(spy).toHaveBeenCalledWith('outbrain', expect.any(Function));
    });

    it('should pick Plista for AU', () => {
        global.Math.random = () => 0;
        let renderer = new PlistaOutbrainRenderer('au');
        const spy = jest.spyOn(renderer, 'renderWidget');
        renderer.render();
        expect(spy).toHaveBeenCalledWith('plista', expect.any(Function));
    });

});
