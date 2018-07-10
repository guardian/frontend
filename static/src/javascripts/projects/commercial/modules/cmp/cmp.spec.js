// @flow
import { _, init } from './cmp';
import { log as log_ } from './log';

const { CmpService } = _;

const log: any = log_;

jest.mock('commercial/modules/cmp/log', () => ({
    log: {
        debug: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
    },
}));

const globalVendorList = {
    vendorListVersion: 1,
    purposes: [
        {
            id: 1,
            name: 'Accessing a Device or Browser',
        },
        {
            id: 2,
            name: 'Advertising Personalisation',
        },
        {
            id: 3,
            name: 'Analytics',
        },
        {
            id: 4,
            name: 'Content Personalisation',
        },
    ],
    vendors: [
        {
            id: 1,
            name: 'Globex',
        },
        {
            id: 2,
            name: 'Initech',
        },
        {
            id: 3,
            name: 'CRS',
        },
        {
            id: 4,
            name: 'Umbrella',
        },
        {
            id: 5,
            name: 'Aperture',
        },
        {
            id: 6,
            name: 'Pierce and Pierce',
        },
    ],
};

class StoreMock {
    vendorList: Object;

    constructor(vendorList) {
        this.vendorList = vendorList;
    }
    getVendorConsentsObject = jest.fn(() => {});
}

describe('cmp', () => {
    let cmp;

    beforeEach(() => {
        // $FlowFixMe I know the Store is a Mock Flow... this is a test
        cmp = new CmpService(new StoreMock(globalVendorList));
        jest.resetAllMocks();
    });

    it('exists', () => {
        expect(init).toBeDefined();
    });

    it('ping executes', () => {
        cmp.processCommand('ping', log.info('ping called!'), result => {
            expect(log.info.mock.calls[0][0]).toMatch('ping called!');
            expect(result.cmpLoaded).toEqual(true);
        });
    });

    it('will log error on invalid use of processCommand', () => {
        cmp.processCommand('fakeCommand');
        expect(log.error.mock.calls[0][0]).toMatch('Invalid CMP command');
    });

    it('getVendorConsents executes', () => {
        cmp.processCommand('getVendorConsents', null, result => {
            expect(result).toEqual({
                metadata: undefined,
                gdprApplies: false,
                hasGlobalScope: false,
            });
        });
    });

    it('getVendorList executes', () => {
        cmp.processCommand('getVendorList', null, result => {
            expect(result.purposes).toEqual(globalVendorList.purposes);
            expect(result.vendors).toEqual(globalVendorList.vendors);
        });
    });

    it('getConsentData executes', () => {
        cmp.processCommand('getConsentData', null, result => {
            expect(result).toEqual({
                consentData: undefined,
                gdprApplies: false,
                hasGlobalScope: false,
            });
        });
    });

    it('processes messages from iframes', () => {
        const source = {
            postMessage: jest.fn(),
        };
        const processSpy = jest.spyOn(cmp, 'processCommand');
        cmp.receiveMessage({
            data: {
                __cmpCall: ({ command: 'showConsentTool' }: any),
            },
            origin: 'example',
            source,
        });
        expect(processSpy.mock.calls[0][0]).toMatch('showConsentTool');
    });
});
