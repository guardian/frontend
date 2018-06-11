// @flow
import { CmpStore, _ } from './store';

import type { VendorConsentData, ConsentData, VendorData } from './types';

const {
    getVendorConsentData,
    generateConsentData,
    generateVendorData,
    generateVendorConsentResponse,
} = _;

jest.mock('commercial/modules/cmp/log', () => ({
    log: {
        debug: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
    },
}));

// Mock the Date constructor to always return the beginning of time
const OriginalDate = global.Date;
global.Date = jest.fn(() => new OriginalDate(0));

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
            id: 8,
            name: 'Aperture',
        },
        {
            id: 10,
            name: 'Pierce and Pierce',
        },
    ],
};

const aDate = new Date('2018-07-15 PDT');
const consentData: ConsentData = {
    cmpId: 1,
    cmpVersion: 1,
    cookieVersion: 1,
    consentScreen: 0,
    consentLanguage: 'EN',
    vendorListVersion: 1,
    created: aDate,
    lastUpdated: aDate,
};

describe('CMP store', () => {
    it('can generate the ConsentData', () => {
        const expected: ConsentData = {
            cmpId: 1,
            cmpVersion: 2,
            cookieVersion: 3,
            consentScreen: 0,
            consentLanguage: 'EN',
            vendorListVersion: 4,
            created: aDate,
            lastUpdated: aDate,
        };
        const result = generateConsentData(1, 2, 3, 4);
        expect(result).toEqual(expected);
    });

    it('can generate the VendorData when consent = true', () => {
        const expected: VendorData = {
            maxVendorId: 10,
            selectedPurposeIds: [1, 2, 3, 4],
            selectedVendorIds: [1, 2, 3, 4, 8, 10],
            vendorList,
        };
        const result = generateVendorData(true, vendorList);
        expect(result).toEqual(expected);
    });

    it('can generate the VendorData when consent = false', () => {
        const expected: VendorData = {
            maxVendorId: 10,
            selectedPurposeIds: [],
            selectedVendorIds: [],
            vendorList,
        };
        const result = generateVendorData(false, vendorList);
        expect(result).toEqual(expected);
    });

    it('getVendorConsentData: returns expected VendorConsentData when consent = false', () => {
        const expected: VendorConsentData = {
            ...consentData,
            maxVendorId: 10,
            selectedPurposeIds: [],
            selectedVendorIds: [],
            vendorList,
        };
        const result = getVendorConsentData(1, 1, 1, false, vendorList);
        expect(result).toEqual(expected);
    });

    it('getVendorConsentData: returns expected VendorConsentData when consent = true', () => {
        const expected: VendorConsentData = {
            ...consentData,
            maxVendorId: 10,
            selectedPurposeIds: [1, 2, 3, 4],
            selectedVendorIds: [1, 2, 3, 4, 8, 10],
            vendorList,
        };
        const result = getVendorConsentData(1, 1, 1, true, vendorList);
        expect(result).toEqual(expected);
    });

    it('can generate a VendorConsentResponse when no IDs are selected', () => {
        const vendorConsentData: VendorConsentData = {
            ...consentData,
            maxVendorId: 10,
            selectedPurposeIds: [],
            selectedVendorIds: [],
        };
        const result = generateVendorConsentResponse(
            vendorConsentData,
            vendorList
        );
        expect(result.purposeConsents).toEqual({
            '1': false,
            '2': false,
            '3': false,
            '4': false,
        });
        expect(result.vendorConsents).toEqual({
            '1': false,
            '2': false,
            '3': false,
            '4': false,
            '5': false,
            '6': false,
            '7': false,
            '8': false,
            '9': false,
            '10': false,
        });
    });

    it('can generate a VendorConsentResponse', () => {
        const vendorConsentData: VendorConsentData = {
            ...consentData,
            maxVendorId: 10,
            selectedPurposeIds: [1, 2, 3, 4],
            selectedVendorIds: [1, 2, 3, 4, 8, 10],
        };
        const result = generateVendorConsentResponse(
            vendorConsentData,
            vendorList
        );
        expect(result.purposeConsents).toEqual({
            '1': true,
            '2': true,
            '3': true,
            '4': true,
        });
        expect(result.vendorConsents).toEqual({
            '1': true,
            '2': true,
            '3': true,
            '4': true,
            '5': false,
            '6': false,
            '7': false,
            '8': true,
            '9': false,
            '10': true,
        });
    });

    it('can generate the VendorConsentResponse for a subset of vendorIds', () => {
        const vendorConsentData: VendorConsentData = {
            ...consentData,
            maxVendorId: 10,
            selectedPurposeIds: [1, 2, 3, 4],
            selectedVendorIds: [1, 2, 3, 4, 8, 10],
        };
        const result = generateVendorConsentResponse(
            vendorConsentData,
            vendorList,
            [4, 6, 8]
        );
        expect(result.purposeConsents).toEqual({
            '1': true,
            '2': true,
            '3': true,
            '4': true,
        });
        expect(result.vendorConsents).toEqual({
            '4': true,
            '6': false,
            '8': true,
        });
    });

    it('can generate a store when consent = true', () => {
        const store = new CmpStore(1, 1, 1, true, vendorList);
        expect(store.canPersonalise).toBe(true);
        expect(store.consentData).toEqual(consentData);
        expect(store.vendorList).toEqual(vendorList);
    });

    it('can generate a store when consent = false', () => {
        const store = new CmpStore(1, 1, 1, false, vendorList);
        expect(store.canPersonalise).toBe(false);
        expect(store.consentData).toEqual(consentData);
        expect(store.vendorList).toEqual(vendorList);
    });
});

afterAll(() => {
    global.Date = OriginalDate;
    expect(new Date().toString()).not.toMatch(new RegExp('Thu Jan 01 1970'));
});
