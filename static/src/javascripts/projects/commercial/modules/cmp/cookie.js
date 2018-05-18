// @flow
import { log } from 'commercial/modules/cmp/log';
import { getCookie, addCookie } from 'lib/cookies';
import {
    vendorVersionMap,
    VENDOR_CONSENT_COOKIE_NAME,
    VENDOR_CONSENT_COOKIE_MAX_AGE,
} from 'commercial/modules/cmp/cmp-env';
import {
    padRight,
    encodeCookieValue,
    decodeCookieValue,
} from 'commercial/modules/cmp/cookieutils';

import type {
    VendorConsentData,
    VendorConsentResult,
    VendorData,
    VendorList,
} from './types';

const encodeVendorCookieValue = (vendorData: VendorData): string =>
    encodeCookieValue(vendorData, vendorVersionMap);

const decodeVendorCookieValue = (cookieValue: string) =>
    decodeCookieValue(cookieValue, vendorVersionMap);

const encodeVendorIdsToBits = (
    maxVendorId: number,
    selectedVendorIds: Array<number> = []
): string => {
    let vendorString = '';
    for (let id = 1; id <= maxVendorId; id += 1) {
        vendorString += selectedVendorIds.includes(id) ? '1' : '0';
    }
    return padRight(
        vendorString,
        Math.max(0, maxVendorId - vendorString.length)
    );
};

const encodePurposeIdsToBits = (
    purposes: Array<{ id: number, name: string }>,
    selectedPurposeIds: Array<number>
): string => {
    const maxPurposeId = Math.max(
        0,
        ...purposes.map(({ id }) => id),
        ...selectedPurposeIds
    );
    let purposeString = '';
    for (let id = 1; id <= maxPurposeId; id += 1) {
        purposeString += selectedPurposeIds.includes(id) ? '1' : '0';
    }
    return purposeString;
};

const decodeBitsToIds = (bitString: string): Array<number> => {
    const ids = bitString.split('').reduce((acc, bit, index) => {
        if (bit === '1') {
            acc.push(index + 1);
        }
        return acc;
    }, []);
    return ids;
};

const convertVendorsToRanges = (
    maxVendorId: number,
    selectedIds: Array<number> = []
): Array<any> => {
    let range = [];
    const ranges = [];
    for (let id = 1; id <= maxVendorId; id += 1) {
        if (selectedIds.includes(id)) {
            range.push(id);
        }

        // If the range has ended or at the end of vendors add entry to the list
        if ((!selectedIds.includes(id) || id === maxVendorId) && range.length) {
            const startVendorId = range.shift();
            const endVendorId = range.pop();
            range = [];
            ranges.push({
                isRange: typeof endVendorId === 'number',
                startVendorId,
                endVendorId,
            });
        }
    }
    return ranges;
};

const encodeVendorConsentData = (vendorData: VendorData): string => {
    const {
        vendorList = {},
        selectedPurposeIds = [],
        selectedVendorIds = [],
        maxVendorId,
    } = vendorData;
    const { purposes } = vendorList;

    // Encode the data with and without ranges and return the smallest encoded payload
    const noRangesData: string = encodeVendorCookieValue({
        ...vendorData,
        maxVendorId,
        purposeIdBitString: encodePurposeIdsToBits(
            purposes,
            selectedPurposeIds
        ),
        isRange: false,
        vendorIdBitString: encodeVendorIdsToBits(
            maxVendorId,
            selectedVendorIds
        ),
    });

    const vendorRangeList = convertVendorsToRanges(
        maxVendorId,
        selectedVendorIds
    );

    const rangesData: string = encodeVendorCookieValue({
        ...vendorData,
        maxVendorId,
        purposeIdBitString: encodePurposeIdsToBits(
            purposes,
            selectedPurposeIds
        ),
        isRange: true,
        defaultConsent: false,
        numEntries: vendorRangeList.length,
        vendorRangeList,
    });

    return noRangesData.length < rangesData.length ? noRangesData : rangesData;
};

const decodeVendorConsentData = (cookieValue: string): VendorConsentResult => {
    const {
        cookieVersion,
        cmpId,
        cmpVersion,
        consentScreen,
        consentLanguage,
        vendorListVersion,
        purposeIdBitString,
        maxVendorId,
        created,
        lastUpdated,
        isRange,
        defaultConsent,
        vendorIdBitString,
        vendorRangeList,
    } = decodeVendorCookieValue(cookieValue);

    const cookieData: VendorConsentResult = {
        cookieVersion,
        cmpId,
        cmpVersion,
        consentScreen,
        consentLanguage,
        vendorListVersion,
        selectedVendorIds: [],
        selectedPurposeIds: decodeBitsToIds(purposeIdBitString),
        maxVendorId,
        created,
        lastUpdated,
    };

    if (isRange) {
        const idMap = vendorRangeList.reduce(
            // eslint-disable-next-line no-shadow
            (acc, { isRange, startVendorId, endVendorId }) => {
                const lastVendorId = isRange ? endVendorId : startVendorId;
                for (let i = startVendorId; i <= lastVendorId; i + 1) {
                    acc[i] = true;
                }
                return acc;
            },
            {}
        );

        for (let i = 0; i <= maxVendorId; i += 1) {
            if (
                (defaultConsent && !idMap[i]) ||
                (!defaultConsent && idMap[i])
            ) {
                cookieData.selectedVendorIds.push(i);
            }
        }
    } else {
        cookieData.selectedVendorIds = decodeBitsToIds(vendorIdBitString);
    }
    return cookieData;
};

const readVendorConsentCookie = () => {
    const cookie = getCookie(VENDOR_CONSENT_COOKIE_NAME);
    log.debug('Read consent data from local cookie', cookie);
    return Promise.resolve(cookie && decodeVendorConsentData(cookie));
};

const writeVendorConsentCookie = (vendorConsentData: VendorConsentData) => {
    log.debug('Write consent data to local cookie', vendorConsentData);
    return Promise.resolve(
        addCookie(
            VENDOR_CONSENT_COOKIE_NAME,
            encodeVendorConsentData(vendorConsentData),
            VENDOR_CONSENT_COOKIE_MAX_AGE,
            true
        )
    );
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

export {
    encodeVendorConsentData,
    decodeVendorConsentData,
    readVendorConsentCookie,
    writeVendorConsentCookie,
    generateVendorData,
};

export const _ = {
    encodeVendorCookieValue,
    decodeVendorCookieValue,
    encodeVendorIdsToBits,
    decodeBitsToIds,
    encodePurposeIdsToBits,
    convertVendorsToRanges,
};
