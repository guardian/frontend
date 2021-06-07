import { defineSlot } from './define-slot';

beforeEach(() => {
    const pubAds = {
        setTargeting: jest.fn(),
    };

    const sizeMapping = {
        sizes: [],
        addSize: jest.fn(function(width, sizes) {
            this.sizes.unshift([width, sizes]);
        }),
        build: jest.fn(function() {
            const tmp = this.sizes;
            this.sizes = [];
            return tmp;
        }),
    };

    window.googletag = {
        defineSlot: jest.fn(() => window.googletag),
        defineSizeMapping: jest.fn(() => window.googletag),
        addService: jest.fn(() => window.googletag),
        setTargeting: jest.fn(),
        pubads() {
            return pubAds;
        },
        sizeMapping() {
            return sizeMapping;
        },
    };
});

describe('Define Slot', () => {
    it('should call defineSlot with correct params', () => {
        const slotDiv = document.createElement("div");
        slotDiv.id = "dfp-ad--top-above-nav";
        slotDiv.setAttribute('data-tablet', '1,1|2,2|728,90|88,71|fluid');
        slotDiv.setAttribute('data-desktop', '1,1|2,2|728,90|940,230|900,250|970,250|88,71|fluid');

        const topAboveNavSizes = {
            tablet: [[1, 1], [2, 2], [728, 90], [88, 71], "fluid"],
            desktop: [[1, 1], [2, 2], [728, 90], [940, 230], [900, 250], [970, 250], [88, 71], "fluid"]
        };

        defineSlot(slotDiv, topAboveNavSizes);

        expect(window.googletag.defineSlot).toHaveBeenCalledWith( undefined, [
            [1, 1], [2, 2], [728, 90], [940, 230], [900, 250], [970, 250], [88, 71], "fluid"],
            "dfp-ad--top-above-nav");
    });
});
