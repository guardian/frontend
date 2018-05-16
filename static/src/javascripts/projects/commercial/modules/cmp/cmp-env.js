// @flow
import type { VendorVersionMap } from './types';

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
            numBits: decodedObject => decodedObject.maxVendorId,
            validator: decodedObject => !decodedObject.isRange,
        },
        {
            name: 'defaultConsent',
            type: 'bool',
            numBits: 1,
            validator: decodedObject => decodedObject.isRange,
        },
        {
            name: 'numEntries',
            numBits: 12,
            type: 'int',
            validator: decodedObject => decodedObject.isRange,
        },
        {
            name: 'vendorRangeList',
            type: 'list',
            listCount: decodedObject => decodedObject.numEntries,
            validator: decodedObject => decodedObject.isRange,
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
                    validator: decodedObject => decodedObject.isRange,
                },
            ],
        },
    ],
};

export const VENDOR_CONSENT_COOKIE_NAME = 'euconsent';
export const VENDOR_CONSENT_COOKIE_MAX_AGE = 33696000;

export const defaultConfig = {
    globalVendorListLocation: 'https://vendorlist.consensu.org/vendorlist.json',
    storeConsentGlobally: false,
    storePublisherData: false,
    logging: 'debug',
    gdprApplies: true,
};

export const vendorVersionList = [vendorVersion];

export const vendorVersionMap: VendorVersionMap = vendorVersionList.reduce(
    (acc, definition) => {
        acc[definition.version] = definition;
        return acc;
    },
    {}
);
