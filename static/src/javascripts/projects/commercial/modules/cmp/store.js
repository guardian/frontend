// @flow strict
import { log } from 'commercial/modules/cmp/log';

import type {
    ConsentData,
    VendorConsentData,
    VendorConsentResponse,
    ShortVendorList,
    SelectedData,
} from 'commercial/modules/cmp/types';

import { readVendorConsentCookie } from './cookie';

type ConsentSelection = {
    maxVendorId: number,
    purposeConsents: { [string]: number },
    vendorConsents: { [string]: number },
};

const generateVendorConsentResponse = (
    vendorConsentData: VendorConsentData,
    shortVendorList: ShortVendorList,
    vendorIds: ?Array<number>
): ConsentSelection => {
    const {
        maxVendorId = 0,
        selectedVendorIds = [],
        selectedPurposeIds = [],
    } = vendorConsentData;

    const purposeMap = {};

    // Initialise allPurposes map
    const allPurposes = shortVendorList.purposeIDs;
    allPurposes.forEach(pid => {
        purposeMap[pid] = false;
    });
    // Set the selected ones to true
    selectedPurposeIds.forEach(pid => {
        purposeMap[pid] = true;
    });

    const vendorMap = {};

    // Initialise vendorMap
    if (vendorIds && vendorIds.length) {
        // We are only interested in those vendorIds to be included in the map
        vendorIds.forEach(vid => {
            vendorMap[vid] = false;
        });
    } else {
        for (let i = 1; i <= maxVendorId; i += 1) {
            // Got through all vendors to initialise vendorMap
            vendorMap[i] = false;
        }
    }

    // and set the ones that are selected to true, only
    // for the ones considered.
    selectedVendorIds
        .filter(svid => svid in vendorMap)
        .forEach(svid => {
            vendorMap[svid] = true;
        });

    return {
        maxVendorId,
        purposeConsents: purposeMap,
        vendorConsents: vendorMap,
    };
};

const generateVendorData = (
    canPersonalise: boolean,
    shortVendorList: ShortVendorList
): SelectedData => {
    const allVendors = Object.keys(shortVendorList.purposesByVID).map(s =>
        parseInt(s, 10)
    );
    const maxVendorId = Math.max(0, ...allVendors);

    if (canPersonalise) {
        const selectedPurposeIds = shortVendorList.purposeIDs;
        const selectedVendorIds = allVendors;

        return {
            selectedPurposeIds,
            selectedVendorIds,
            maxVendorId,
        };
    }
    return {
        selectedPurposeIds: [],
        selectedVendorIds: [],
        maxVendorId,
    };
};

/* 
   This is a stub. For now it just enriches the
   given parameters with some constant context data.
*/
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
    shortVendorList: ShortVendorList,
    isRunningCmpCustomise: boolean = false
): ?VendorConsentData => {
    if (isRunningCmpCustomise) {
        log.info('getVendorConsentData: Running Cmp Customise');
        const cookieVal = readVendorConsentCookie();
        if (cookieVal) return { ...cookieVal };
    }
    if (typeof canPersonalise === 'boolean') {
        const consentData = generateConsentData(
            cmpId,
            cmpVersion,
            cookieVersion,
            shortVendorList.version
        );
        const selectedData = generateVendorData(
            canPersonalise,
            shortVendorList
        );
        return { ...consentData, ...selectedData };
    }
    log.warn('Missing value for consent state, Store will be incomplete');
};

export class CmpStore {
    shortVendorList: ShortVendorList;
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
        shortVendorList: ShortVendorList,
        isRunningCmpCustomise: boolean = false
    ) {
        this.shortVendorList = shortVendorList;
        this.canPersonalise = canPersonalise;
        this.allowedVendorIds = Object.keys(shortVendorList.purposesByVID).map(
            s => parseInt(s, 10)
        );
        this.consentData = generateConsentData(
            cmpId,
            cmpVersion,
            cookieVersion,
            shortVendorList.version
        );
        this.vendorConsentData = getVendorConsentData(
            cmpId,
            cmpVersion,
            cookieVersion,
            canPersonalise,
            shortVendorList,
            isRunningCmpCustomise
        );
    }

    getVendorConsentsObject = (
        vendorIds: ?Array<number>
    ): ?VendorConsentResponse => {
        if (this.vendorConsentData) {
            const consentDataResponse = generateVendorConsentResponse(
                this.vendorConsentData,
                this.shortVendorList,
                vendorIds
            );
            log.info(
                'GetVendorConsentsObject: Successfully generated response'
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
