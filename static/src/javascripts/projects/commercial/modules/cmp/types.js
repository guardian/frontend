// @flow
export type CmpConfig = {
    gdprApplies: boolean,
    storeConsentGlobally: boolean,
    storePublisherData: boolean,
    logging: string | boolean,
    globalVendorListLocation?: string,
};

export type ConsentDataResponse = {
    gdprApplies: boolean,
    hasGlobalScope: boolean,
    consentData?: string,
};

export type Purpose = {
    id: number,
    name: string,
};

export type Vendor = {
    id: number,
    name: string,
    policyUrl?: string,
    purposeIds?: Array<number>,
    legIntPurposeIds?: Array<number>,
    featureIds?: Array<number>,
};

export type VendorList = {
    vendorListVersion: number,
    lastUpdated?: string,
    purposes: Array<Purpose>,
    vendors: Array<Vendor>,
};

export type ShortVendorList = {
    purposeIDs: Array<number>,
    purposesByVID: { [string]: Array<number> },
    legIntPurposesByVID: { [string]: Array<number> },
    featuresIdsByVID: { [string]: Array<number> }
};

export type SelectedData = {
    selectedPurposeIds: Array<number>,
    selectedVendorIds: Array<number>,
    maxVendorId: number,
};

export type ConsentData = {
    cookieVersion: number,
    cmpId: number,
    cmpVersion: number,
    vendorListVersion: number,
    created: Date,
    lastUpdated: Date,
    consentScreen: number,
    consentLanguage: string,
};

export type VendorConsentData = ConsentData & {
    maxVendorId: number,
    selectedPurposeIds: Array<number>,
    selectedVendorIds: Array<number>,
};

export type VendorConsentResponse = ConsentData & {
    maxVendorId: number,
    purposeConsents: { [string]: number },
    vendorConsents: { [string]: number },
};

export type Range = {
    isRange: boolean,
    startVendorId: number,
    endVendorId: number,
};

export type VendorCookieData = {
    cookieVersion: number,
    cmpId: number,
    cmpVersion: number,
    consentScreen: number,
    consentLanguage: string,
    vendorListVersion: number,
    purposeIdBitString: string,
    maxVendorId: number,
    created: Date,
    lastUpdated: Date,
    isRange: boolean,
    defaultConsent: boolean,
    vendorIdBitString: string,
    vendorRangeList: Array<Range>,
};
