// @flow
import { imrWorldwide } from './imr-worldwide';

const { shouldRun, url, onLoad } = imrWorldwide;

jest.mock('lib/config', () => ({
    switches: {
        imrWorldwide: true,
    },
    page: {
        headline: 'Starship Enterprise',
        author: 'Captain Kirk',
        section: 'spaceexploration',
        sectionName: 'Space Exploration',
        keywords: 'Space,Travel',
        webPublicationDate: 1498113262000,
        isFront: false,
        isPaidContent: true,
        pageId: 100,
    },
}));

const nSdkInstance = {
    ggInitialize: jest.fn(),
    ggPM: jest.fn(),
};

window.NOLCMB = {
    getInstance: jest.fn(() => nSdkInstance),
};

describe('third party tag IMR worldwide', () => {
    it('should exist and have the correct exports', () => {
        expect(shouldRun).toBe(true);
        expect(url).toBe(
            '//secure-dcr.imrworldwide.com/novms/js/2/ggcmb510.js'
        );
    });

    it('should initalize, with a brand-only apid on an unmatched section', () => {
        // If a section does not exist in guMetadata, it will use the default apid
        const expectedNolggParams = {
            sfcode: 'dcr',
            apid: 'P0EE0F4F4-8D7C-4082-A2A4-82C84728DC59',
            apn: 'theguardian',
        };
        // $FlowFixMe - onLoad will be there, and be a function. Promise.
        onLoad();
        expect(nSdkInstance.ggInitialize).toBeCalledWith(expectedNolggParams);
    });

    it('should call nSdkInstance.ggPM with staticstart and dcrStaticMetadata', () => {
        const expectedMetadata = {
            assetid: 100,
            section: 'The Guardian - brand only',
            type: 'static',
        };
        // $FlowFixMe - onLoad will be there, and be a function. Promise.
        onLoad();
        expect(nSdkInstance.ggPM).toBeCalledWith(
            'staticstart',
            expectedMetadata
        );
    });
});
