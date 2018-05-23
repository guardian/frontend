// @flow
import { log } from 'commercial/modules/cmp/log';

import type {
    ConsentData,
    VendorData,
    VendorList,
    VendorConsentData,
    VendorConsentResponse,
} from 'commercial/modules/cmp/types';

type ConsentSelection = {
    maxVendorId: number,
    purposeConsents: { [string]: number },
    vendorConsents: { [string]: number },
};

const generateVendorConsentResponse = (
    vendorConsentData: VendorConsentData,
    vendorList: VendorList,
    vendorIds: ?Array<number>
): ConsentSelection => {
    const {
        maxVendorId = 0,
        selectedVendorIds = [],
        selectedPurposeIds = [],
    } = vendorConsentData;

    const allPurposes = vendorList.purposes.map(_ => _.id);
    const maxPurposeId = Math.max(0, ...allPurposes);
    const vendorMap = {};
    const purposeMap = {};

    for (let i = 1; i <= maxPurposeId; i += 1) {
        purposeMap[i] = selectedPurposeIds.includes(i);
    }

    if (vendorIds && vendorIds.length) {
        vendorIds.forEach(
            // eslint-disable-next-line no-return-assign
            id => (vendorMap[id] = selectedVendorIds.includes(id))
        );
    } else {
        for (let i = 1; i <= maxVendorId; i += 1) {
            vendorMap[i] = selectedVendorIds.includes(i);
        }
    }
    return {
        maxVendorId,
        purposeConsents: purposeMap,
        vendorConsents: vendorMap,
    };
};

const generateVendorData = (
    canPersonalise: boolean,
    vendorList: VendorList
): VendorData => {
    const allVendors = vendorList.vendors.map(_ => _.id);
    const maxVendorId = Math.max(0, ...allVendors);

    if (canPersonalise) {
        const selectedPurposeIds = vendorList.purposes.map(_ => _.id);
        const selectedVendorIds = allVendors;

        return {
            vendorList,
            selectedPurposeIds,
            selectedVendorIds,
            maxVendorId,
        };
    }
    return {
        vendorList,
        selectedPurposeIds: [],
        selectedVendorIds: [],
        maxVendorId,
    };
};

const generateConsentData = (
    cmpId: number,
    cmpVersion: number,
    cookieVersion: number,
    vendorListVersion: number
): ConsentData => {
    const currentDate: Date = new Date();
    return {
        cmpId,
        cmpVersion,
        cookieVersion,
        vendorListVersion,
        created: currentDate,
        lastUpdated: currentDate,
        consentLanguage: 'EN',
        consentScreen: 0,
    };
};

const getVendorConsentData = (
    cmpId: number,
    cmpVersion: number,
    cookieVersion: number,
    canPersonalise: boolean | null,
    vendorList: VendorList
): ?VendorConsentData => {
    if (typeof canPersonalise === 'boolean') {
        const consentData = generateConsentData(
            cmpId,
            cmpVersion,
            cookieVersion,
            vendorList.vendorListVersion
        );
        const vendorData = generateVendorData(canPersonalise, vendorList);
        return { ...consentData, ...vendorData };
    }
    log.warn('Missing value for consent state, Store will be incomplete');
};

export class CmpStore {
    vendorList: VendorList;
    consentData: ConsentData;
    canPersonalise: boolean | null;
    allowedVendorIds: Array<number>;
    vendorConsentData: ?VendorConsentData;
    vendorConsentResponse: ?VendorConsentResponse;
    getVendorConsentsObject: () => ?VendorConsentResponse;

    constructor(
        cmpId: number,
        cmpVersion: number,
        cookieVersion: number,
        canPersonalise: boolean | null,
        vendorList: VendorList
    ) {
        this.vendorList = vendorList;
        this.canPersonalise = canPersonalise;
        this.allowedVendorIds = vendorList.vendors.map(_ => _.id);
        this.consentData = generateConsentData(
            cmpId,
            cmpVersion,
            cookieVersion,
            vendorList.vendorListVersion
        );
        this.vendorConsentData = getVendorConsentData(
            cmpId,
            cmpVersion,
            cookieVersion,
            canPersonalise,
            vendorList
        );
    }

    getVendorConsentsObject = (
        vendorIds: ?Array<number>
    ): ?VendorConsentResponse => {
        log.info('generating the VendorConsentData....');
        if (this.vendorConsentData) {
            const consentDataResponse = generateVendorConsentResponse(
                this.vendorConsentData,
                this.vendorList,
                vendorIds
            );
            return {
                ...this.consentData,
                ...consentDataResponse,
            };
        }
    };
}

export const _ = {
    generateConsentData,
    getVendorConsentData,
    generateVendorData,
    generateVendorConsentResponse,
};
