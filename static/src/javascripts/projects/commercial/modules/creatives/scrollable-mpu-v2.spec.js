// @flow
import fastdom from 'fastdom';
import { ScrollableMpu } from 'commercial/modules/creatives/scrollable-mpu-v2';
import { addTrackingPixel } from 'commercial/modules/creatives/add-tracking-pixel';
import { addViewabilityTracker } from 'commercial/modules/creatives/add-viewability-tracker';

jest.mock('commercial/modules/creatives/add-tracking-pixel', () => ({
    addTrackingPixel: jest.fn(),
}));

jest.mock('commercial/modules/creatives/add-viewability-tracker', () => ({
    addViewabilityTracker: jest.fn(),
}));

jest.mock('lib/detect', () => ({
    isAndroid: jest.fn(),
}));

const testParams = {
    id: '',
    backgroundImage: '',
    backgroundImagePType: '',
    layer1Image: '',
    mobileImage: '',
    destination: '',
    trackingPixel: '',
    researchPixel: '',
    cacheBuster: '',
    viewabilityTracker: '',
    clickMacro: '',
};

describe('Scrollable MPU', () => {
    let adSlot: any;

    beforeEach(() => {
        if (document.body) {
            document.body.innerHTML = '<div></div>';
        }
        adSlot = document.querySelector('div');
    });

    afterEach(() => {
        if (document.body) {
            document.body.innerHTML = '';
        }
        adSlot = null;
    });

    it('should exist', () => {
        expect(ScrollableMpu).toBeDefined();
    });

    it('should add tracking pixels', () => {
        const theParams = Object.assign({}, testParams, {
            trackingPixel: 'trackingPixel',
            researchPixel: 'researchPixel',
            cacheBuster: '+-+-+-+',
        });
        new ScrollableMpu(adSlot, theParams).create();
        expect(addTrackingPixel).toHaveBeenCalledTimes(2);
        expect(addTrackingPixel).toHaveBeenCalledWith('researchPixel+-+-+-+');
        expect(addTrackingPixel).toHaveBeenCalledWith('trackingPixel+-+-+-+');
    });

    it('should add viewability tracker', () => {
        const theParams = Object.assign({}, testParams, {
            id: 'id',
            viewabilityTracker: 'viewabilityTracker',
        });
        new ScrollableMpu(adSlot, theParams).create();
        expect(addViewabilityTracker).toHaveBeenCalledTimes(1);
        expect(addViewabilityTracker).toHaveBeenCalledWith(
            adSlot,
            'id',
            'viewabilityTracker'
        );
    });

    it('should set up background for fluid250', done => {
        const theParams = Object.assign({}, testParams, {
            backgroundImagePType: 'fixed matching fluid250',
            backgroundImage: 'image',
        });
        new ScrollableMpu(adSlot, theParams).create();
        fastdom.measure(() => {
            expect(
                document.querySelector(
                    '.creative--scrollable-mpu-image.creative--scrollable-mpu-image-fixed'
                )
            ).not.toBeNull();
            done();
        });
    });

    it('should set up background for parallax', done => {
        const theParams = Object.assign({}, testParams, {
            backgroundImagePType: 'parallax',
            backgroundImage: 'image',
        });
        new ScrollableMpu(adSlot, theParams).create();
        fastdom.measure(() => {
            expect(
                document.querySelector(
                    '.creative--scrollable-mpu-image.creative--scrollable-mpu-image-parallax'
                )
            ).not.toBeNull();
            done();
        });
    });
});
