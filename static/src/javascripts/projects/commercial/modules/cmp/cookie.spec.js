// @flow

import {
    _,
    encodeVendorConsentData,
    decodeVendorConsentData,
    readVendorConsentCookie,
    writeVendorConsentCookie,
} from './cookie';

import type { VendorConsentData, ConsentData } from './types';

const {
    encodeVendorCookieValue,
    decodeVendorCookieValue,
    encodeVendorIdsToBits,
    decodeBitsToIds,
    encodePurposeIdsToBits,
    convertVendorsToRanges,
} = _;

jest.mock('commercial/modules/cmp/log', () => ({
    log: {
        debug: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
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
const maxVendorId = vendorList.vendors[vendorList.vendors.length - 1].id;

const vendorConsentData: VendorConsentData = {
    cookieVersion: 1,
    cmpId: 1,
    cmpVersion: 1,
    consentScreen: 1,
    consentLanguage: 'EN',
    vendorListVersion: 1,
    maxVendorId,
    created: aDate,
    lastUpdated: aDate,
    selectedPurposeIds: [1, 2],
    selectedVendorIds: [1, 2, 4],
};

describe('CMP cookie', () => {
    let cookieValue = '';

    Object.defineProperty(document, 'domain', { value: 'www.theguardian.com' });
    Object.defineProperty(
        document,
        'cookie',
        ({
            get() {
                return cookieValue
                    .replace('|', ';')
                    .replace(/^[;|]|[;|]$/g, '');
            },

            set(value) {
                const name = value.split('=')[0];
                const newVal = cookieValue
                    .split('|')
                    .filter(cookie => cookie.split('=')[0] !== name);

                newVal.push(value);
                cookieValue = newVal.join('|');
            },
        }: Object)
    );

    beforeEach(() => {
        cookieValue = '';
    });

    it('can encodePurposeIdsToBits', () => {
        const purposes = [
            {
                id: 1,
                name: 'Accessing a Device or Browser',
            },
            {
                id: 2,
                name: 'Advertising Personalisation',
            },
        ];

        const result = encodePurposeIdsToBits(purposes, [1, 2]);
        expect(result).toBe('11');
    });

    it('can encodeVendorIdsToBits', () => {
        const result = encodeVendorIdsToBits(6, [1, 2, 4]);
        expect(result).toBe('110100');
    });

    it('can decodeBitsToIds', () => {
        expect(decodeBitsToIds('110100')).toEqual([1, 2, 4]);
        expect(decodeBitsToIds('11')).toEqual([1, 2]);
    });

    it('correctly encodes the vendor cookie object to a string', () => {
        const consentData: ConsentData = {
            cookieVersion: 1,
            cmpId: 1,
            cmpVersion: 1,
            vendorListVersion: 1,
            created: aDate,
            lastUpdated: aDate,
            consentLanguage: 'AA',
            consentScreen: 0,
        };
        // $FlowFixMe I know fields are missing, Flow... this is a test
        expect(encodeVendorConsentData({ ...consentData, vendorList })).toEqual(
            'BAAAAAAAAAAAAABABAAAABAAAAAAAA'
        );

        expect(
            encodeVendorConsentData({ ...vendorConsentData, vendorList })
        ).toEqual('BAAAAAAAAAAAAABABBENABwAAAAApoA');
    });

    it('decodes the vendor cookie object from a string', () => {
        const consentData: ConsentData = {
            cookieVersion: 1,
            cmpId: 1,
            cmpVersion: 1,
            vendorListVersion: 1,
            created: aDate,
            lastUpdated: aDate,
            consentLanguage: 'AA',
            consentScreen: 0,
        };
        // the encoding process will add defaults for missing properties
        const generatedDefaults = {
            maxVendorId: 0,
            selectedPurposeIds: [],
            selectedVendorIds: [],
        };

        expect(
            decodeVendorConsentData('BAAAAAAAAAAAAABABAAAABAAAAAAAA')
        ).toEqual({ ...consentData, ...generatedDefaults });
        expect(
            decodeVendorConsentData('BAAAAAAAAAAAAABABBENABwAAAAApoA')
        ).toEqual(vendorConsentData);
    });

    it('writes and reads the local cookie', () =>
        writeVendorConsentCookie({
            ...vendorConsentData,
            vendorList,
        }).then(() =>
            readVendorConsentCookie().then(fromCookie => {
                expect(document.cookie).toEqual(
                    'euconsent=BAAAAAAAAAAAAABABBENABwAAAAApoA; path=/; expires=Fri, 07 Jul 94226 23:00:00 GMT; domain=.theguardian.com'
                );
                expect(fromCookie).toEqual(vendorConsentData);
            })
        ));

    it('converts selected vendor list to a range', () => {
        const maxId = Math.max(...vendorList.vendors.map(vendor => vendor.id));
        const ranges = convertVendorsToRanges(maxId, [2, 3, 4]);

        expect(ranges).toEqual([
            {
                isRange: true,
                startVendorId: 2,
                endVendorId: 4,
            },
        ]);
    });

    it('converts selected vendor list to multiple ranges', () => {
        const maxId = Math.max(...vendorList.vendors.map(vendor => vendor.id));
        const ranges = convertVendorsToRanges(maxId, [2, 3, 5, 6, 10]);

        expect(ranges).toEqual([
            {
                isRange: true,
                startVendorId: 2,
                endVendorId: 3,
            },
            {
                isRange: true,
                startVendorId: 5,
                endVendorId: 6,
            },
            {
                isRange: false,
                startVendorId: 10,
                endVendorId: undefined,
            },
        ]);
    });

    it('fails to encode a cookie version that does not exist', () => {
        const consentData = {
            cookieVersion: 999,
            created: aDate,
            lastUpdated: aDate,
            cmpId: 1,
            vendorListVersion: 1,
            maxVendorId: 2,
        };
        // $FlowFixMe I know fields are missing, Flow... this is a test
        const bitString = encodeVendorCookieValue(consentData);
        expect(bitString).toBeUndefined();
    });

    it('fails to encode an invalid cookie version', () => {
        const consentData = {
            cookieVersion: 'hello',
            created: aDate,
            lastUpdated: aDate,
            cmpId: 1,
            vendorListVersion: 1,
            maxVendorId: 2,
        };
        // $FlowFixMe I know fields are missing, Flow... this is a test
        const bitString = encodeVendorCookieValue(consentData);
        expect(bitString).toBeUndefined();
    });

    it('fails to decode an invalid cookie version', () => {
        const decoded = decodeVendorCookieValue('000001111011');
        expect(decoded).toEqual({});
    });

    it('encodes and decodes the vendor cookie value with ranges back to original value', () => {
        const consentData = {
            cookieVersion: 1,
            created: aDate,
            lastUpdated: aDate,
            cmpId: 1,
            cmpVersion: 1,
            consentScreen: 1,
            consentLanguage: 'EN',
            vendorListVersion: 1,
            purposeIdBitString: '111000001010101010001101',
            maxVendorId: 5,
            isRange: true,
            defaultConsent: false,
            numEntries: 2,
            vendorRangeList: [
                {
                    isRange: true,
                    startVendorId: 2,
                    endVendorId: 4,
                },
                {
                    isRange: false,
                    startVendorId: 1,
                },
            ],
        };
        // $FlowFixMe I know fields are missing, Flow... this is a test
        const bitString: string = encodeVendorCookieValue(consentData);
        const decoded = decodeVendorCookieValue(bitString);

        expect(decoded).toEqual(consentData);
    });

    it('encodes and decodes the vendor cookie value with range ranges back to original value', () => {
        const consentData = {
            cookieVersion: 1,
            created: aDate,
            lastUpdated: aDate,
            cmpId: 1,
            cmpVersion: 1,
            consentScreen: 1,
            consentLanguage: 'EN',
            vendorListVersion: 1,
            purposeIdBitString: '111000001010101010001101',
            maxVendorId: 5,
            isRange: true,
            defaultConsent: false,
            numEntries: 2,
            vendorRangeList: [
                {
                    isRange: false,
                    startVendorId: 2,
                },
                {
                    isRange: false,
                    startVendorId: 1,
                },
            ],
        };
        // $FlowFixMe I know fields are missing, Flow... this is a test
        const bitString: string = encodeVendorCookieValue(consentData);
        const decoded = decodeVendorCookieValue(bitString);

        expect(decoded).toEqual(consentData);
    });

    it('encodes and decodes the vendor cookie value without ranges back to original value', () => {
        const consentData = {
            cookieVersion: 1,
            created: aDate,
            lastUpdated: aDate,
            cmpId: 1,
            cmpVersion: 1,
            consentScreen: 1,
            consentLanguage: 'EN',
            vendorListVersion: 1,
            purposeIdBitString: '000000001010101010001100',
            maxVendorId: 5,
            isRange: false,
            vendorIdBitString: '10011',
        };

        // $FlowFixMe I know fields are missing, Flow... this is a test
        const bitString: string = encodeVendorCookieValue(consentData);
        const decoded = decodeVendorCookieValue(bitString);

        expect(bitString).toEqual('BAAAAAAAAAAAAABABBENABAKqMAAVMA');
        expect(decoded).toEqual(consentData);
    });
});

afterAll(() => {
    global.Date = OriginalDate;
    expect(new Date()).not.toMatch(new RegExp('Thu Jan 01 1970'));
});
