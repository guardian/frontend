// @flow

export type CmpConfig = {
    globalVendorListLocation: string,
    gdprApplies: boolean,
    storeConsentGlobally: boolean,
    storePublisherData: boolean,
    logging: string | boolean,
};

export type ConsentDataResponse = {
    gdprApplies: boolean,
    hasGlobalScope: boolean,
    consentData: string,
};

export type ConsentData = {
    cookieVersion: number,
    cmpId: number,
    cmpVersion: number,
    consentScreen: number,
    consentLanguage: string,
    created: Date,
    lastUpdated: Date,
};

export type Purpose = {
    id: number,
    name: string,
};

export type Vendor = {
    id: number,
    name: string,
    policyUrl?: string,
};

export type VendorList = {
    vendorListVersion: number,
    lastUpdated?: string,
    purposes: Array<Purpose>,
    vendors: Array<Vendor>,
};

export type VendorData = {
    vendorList: VendorList,
    selectedPurposeIds: Array<number>,
    selectedVendorIds: Array<number>,
    maxVendorId: number,
};

export type VendorConsentData = {
    cookieVersion: number,
    cmpId: number,
    cmpVersion: number,
    vendorListVersion: number,
    created: Date,
    lastUpdated: Date,
    consentScreen: number,
    consentLanguage: string,
};

export type VendorConsentResult = VendorConsentData & {
    maxVendorId: number,
    selectedPurposeIds: Array<number>,
    selectedVendorIds: Array<number>,
};

export type Store = {
    vendorList: VendorList,
    persistedVendorConsentData?: VendorConsentResult,
    allowedVendorIds?: Array<number>,
};

export type Cmp = {
    commandQueue: Array<any>,
    config: CmpConfig,
    addLocatorFrame: () => void,
    receiveMessage: () => void,
    listen: () => void,
};
