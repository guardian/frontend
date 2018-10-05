// @flow strict
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

import type { VendorConsentData, Range, ShortVendorList } from './types';

const encodeVendorCookieValue = (data: VendorConsentData): ?string => {
    if (data && data.cookieVersion) {
        return encodeCookieValue(data, vendorVersionMap);
    }
};

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
    purposeIDs: Array<number>,
    selectedPurposeIds: Array<number>
): string => {
    const maxPurposeId = Math.max(0, ...purposeIDs, ...selectedPurposeIds);
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
): Array<Range> => {
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

const encodeVendorConsentData = (
    data: VendorConsentData,
    shortVendorList?: ShortVendorList
): string => {
    const {
        selectedPurposeIds = [],
        selectedVendorIds = [],
        maxVendorId,
    } = data;

    const purposeIDs = shortVendorList ? shortVendorList.purposeIDs : [];

    // Encode the data with and without ranges and return the smallest encoded payload
    const noRangesData: ?string = encodeVendorCookieValue({
        ...data,
        maxVendorId,
        purposeIdBitString: encodePurposeIdsToBits(
            purposeIDs,
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

    const rangesData: ?string = encodeVendorCookieValue({
        ...data,
        maxVendorId,
        purposeIdBitString: encodePurposeIdsToBits(
            purposeIDs,
            selectedPurposeIds
        ),
        isRange: true,
        defaultConsent: false,
        numEntries: vendorRangeList.length,
        vendorRangeList,
    });
    // flowlint sketchy-null-string:warn
    if (noRangesData && rangesData) {
        return noRangesData.length < rangesData.length
            ? noRangesData
            : rangesData;
    }
    log.error('Could not encode vendor consent data');
    return '';
};

const decodeVendorConsentData = (cookieValue: string): VendorConsentData => {
    // $FlowFixMe allowing Object just this once since sanity checks below
    const decoded: Object = decodeVendorCookieValue(cookieValue);
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
    } = decoded;

    const cookieData: VendorConsentData = {
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
                for (let i = startVendorId; i <= lastVendorId; i += 1) {
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

const readVendorConsentCookie = (): VendorConsentData | false => {
    const cookieVal: ?string = getCookie(VENDOR_CONSENT_COOKIE_NAME);
    if (cookieVal) {
        log.info(`Read consent data from cookie: ${cookieVal}`);
        return decodeVendorConsentData(cookieVal);
    }
    log.info('Unable to read from CMP cookie');
    return false;
};

const writeVendorConsentCookie = (
    vendorConsentData: VendorConsentData
): Promise<void> => {
    log.debug(`Attempting to write consent data to cookie`, vendorConsentData);
    return Promise.resolve(
        addCookie(
            VENDOR_CONSENT_COOKIE_NAME,
            encodeVendorConsentData(vendorConsentData),
            VENDOR_CONSENT_COOKIE_MAX_AGE,
            true
        )
    );
};

export {
    encodeVendorConsentData,
    decodeVendorConsentData,
    readVendorConsentCookie,
    writeVendorConsentCookie,
};

export const _ = {
    encodeVendorCookieValue,
    decodeVendorCookieValue,
    encodeVendorIdsToBits,
    decodeBitsToIds,
    encodePurposeIdsToBits,
    convertVendorsToRanges,
};
