// @flow

export type CmpConfig = {
    globalVendorListLocation: string,
    gdprApplies: boolean,
    storeConsentGlobally: boolean,
    storePublisherData: boolean,
    logging: string | boolean,
};

export type ConsentData = {
    gdprApplies: boolean,
    hasGlobalScope: boolean,
    consentData: string,
};

export type VendorData = {
    vendorList: Object,
    selectedPurposeIds: Array<number>,
    selectedVendorIds: Array<number>,
    maxVendorId: number,
};

export type VendorConsentData = {
    cookieVersion: number,
    cmpId: number,
    cmpVersion: number,
    consentScreen: number,
    consentLanguage: string,
    vendorListVersion: number,
    maxVendorId: number,
    created: Date,
    lastUpdated: Date,
    selectedPurposeIds: Array<number>,
    selectedVendorIds: Array<number>,
};

export type VendorVersionMap = {};

export type Cmp = {
    commandQueue: Array<any>,
    config: CmpConfig,
    addLocatorFrame: () => void,
    receiveMessage: () => void,
    listen: () => void,
};
