// @flow strict

type DecodedObject = {
    maxVendorId: number,
    isRange: boolean,
    numEntries: number,
};

const vendorVersion = {
    version: 1,
    fields: [
        { name: 'cookieVersion', type: 'int', numBits: 6 },
        { name: 'created', type: 'date', numBits: 36 },
        { name: 'lastUpdated', type: 'date', numBits: 36 },
        { name: 'cmpId', type: 'int', numBits: 12 },
        { name: 'cmpVersion', type: 'int', numBits: 12 },
        { name: 'consentScreen', type: 'int', numBits: 6 },
        { name: 'consentLanguage', type: '6bitchar', numBits: 12 },
        { name: 'vendorListVersion', type: 'int', numBits: 12 },
        { name: 'purposeIdBitString', type: 'bits', numBits: 24 },
        { name: 'maxVendorId', type: 'int', numBits: 16 },
        { name: 'isRange', type: 'bool', numBits: 1 },
        {
            name: 'vendorIdBitString',
            type: 'bits',
            numBits: (decodedObject: DecodedObject) =>
                decodedObject.maxVendorId,
            validator: (decodedObject: DecodedObject) => !decodedObject.isRange,
        },
        {
            name: 'defaultConsent',
            type: 'bool',
            numBits: 1,
            validator: (decodedObject: DecodedObject) => decodedObject.isRange,
        },
        {
            name: 'numEntries',
            numBits: 12,
            type: 'int',
            validator: (decodedObject: DecodedObject) => decodedObject.isRange,
        },
        {
            name: 'vendorRangeList',
            type: 'list',
            listCount: (decodedObject: DecodedObject) =>
                decodedObject.numEntries,
            validator: (decodedObject: DecodedObject) => decodedObject.isRange,
            fields: [
                {
                    name: 'isRange',
                    type: 'bool',
                    numBits: 1,
                },
                {
                    name: 'startVendorId',
                    type: 'int',
                    numBits: 16,
                },
                {
                    name: 'endVendorId',
                    type: 'int',
                    numBits: 16,
                    validator: (decodedObject: DecodedObject) =>
                        decodedObject.isRange,
                },
            ],
        },
    ],
};

export const VENDOR_CONSENT_COOKIE_NAME = 'euconsent';
export const VENDOR_CONSENT_COOKIE_MAX_AGE = 33696000;
export const CMP_GLOBAL_NAME = '__cmp';
export const CMP_ID = 112;
export const CMP_VERSION = 1;
export const COOKIE_VERSION = 1;
export const COOKIE_NAME = 'GU_TK';

export const defaultConfig = {
    storeConsentGlobally: false,
    storePublisherData: false,
    logging: false,
    gdprApplies: true,
};

export const vendorVersionList = [vendorVersion];

export const vendorVersionMap = vendorVersionList.reduce((acc, definition) => {
    acc[definition.version] = definition;
    return acc;
}, {});
