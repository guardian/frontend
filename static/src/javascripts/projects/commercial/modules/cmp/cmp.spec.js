// @flow
import { log as log_ } from './log';
import { _, init } from './cmp';

const { CmpService, generateStore } = _;

const log: any = log_;

jest.mock('commercial/modules/cmp/log', () => ({
    log: {
        debug: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
    },
}));

const vendorList = {
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

describe('cmp', () => {
    let cmp;

    it('exists', () => {
        expect(init).toBeDefined();
    });

    beforeEach(() => {
        cmp = new CmpService({ vendorList });
        jest.resetAllMocks();
    });

    it('can generate a store', () => {
        const store = generateStore(vendorList);
        expect(store.allowedVendorIds).toEqual([1, 2, 3, 4, 5, 6]);
        expect(store.vendorList).toEqual(vendorList);
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
            expect(Object.keys(result.purposeConsents).length).toEqual(
                vendorList.purposes.length
            );
            expect(Object.keys(result.vendorConsents).length).toEqual(6);
        });
    });

    it('getVendorList executes', () => {
        cmp.processCommand('getVendorList', null, result => {
            expect(result.purposes).toEqual(vendorList.purposes);
            expect(result.vendors).toEqual(vendorList.vendors);
        });
    });

    it('getConsentData executes', () => {
        cmp.processCommand('getConsentData', null, result => {
            expect(typeof result.consentData).toEqual('string');
        });
    });

    it('processes messages from iframes', () => {
        const source = {
            postMessage: jest.fn(),
        };
        const processSpy = jest.spyOn(cmp, 'processCommand');
        cmp.receiveMessage({
            data: {
                __cmpCall: { command: 'showConsentTool' },
            },
            origin: {},
            source,
        });
        expect(processSpy.mock.calls[0][0]).toMatch('showConsentTool');
    });
});
