import ophan from 'ophan/ng';
import config from 'lib/config';
import { constructQuery as constructURLQuery } from 'lib/url';





const ACQUISITION_DATA_FIELD = 'acquisitionData';

export const submitComponentEvent = (componentEvent) => {
    ophan.record({ componentEvent });
};

export const submitInsertEvent = (
    componentEvent
) =>
    submitComponentEvent({
        ...componentEvent,
        action: 'INSERT',
    });

export const submitViewEvent = (componentEvent) =>
    submitComponentEvent({
        ...componentEvent,
        action: 'VIEW',
    });

export const submitClickEvent = (componentEvent) =>
    submitComponentEvent({
        ...componentEvent,
        action: 'CLICK',
    });

// Treats url as immutable, i.e. returns a new object
// rather than modifying the existing one in place.
// If the url already has an acquisitionData JSON parameter,
// it will add or overwrite individual properties rather than
// replacing the entire param.
export const updateAcquisitionData = (
    url,
    acquisitionData
) => {
    let existingAcquisitionData;

    try {
        const existingAcquisitionJsonString = url.searchParams.get(
            ACQUISITION_DATA_FIELD
        );

        if (!existingAcquisitionJsonString) return url;

        existingAcquisitionData = JSON.parse(existingAcquisitionJsonString);
    } catch (e) {
        return url;
    }

    // make a copy
    const newUrl = new URL(url.toString());

    newUrl.searchParams.set(
        ACQUISITION_DATA_FIELD,
        JSON.stringify({
            ...existingAcquisitionData,
            ...acquisitionData,
        })
    );

    return newUrl;
};

export const addReferrerData = (acquisitionData) =>
    // Note: the current page is the referrer data in the context of the acquisition.
    ({
        ...acquisitionData,
        referrerPageviewId: config.get('ophan.pageViewId'),
        referrerUrl: window.location.href.split('?')[0],
    });

// Adds acquisition tracking codes if it is a support url
export const addTrackingCodesToUrl = ({
    base,
    componentType,
    componentId,
    campaignCode,
    abTest,
}) => {
    const isSupportUrl = base.search(/(support.theguardian.com)(\/[a-z]*)?\/(contribute|subscribe)/) >= 0;

    if (isSupportUrl) {
        const acquisitionData = addReferrerData({
            source: 'GUARDIAN_WEB',
            componentId,
            componentType,
            campaignCode,
            abTest,
        });

        const params = {
            REFPVID: config.get('ophan.pageViewId') || 'not_found',
            INTCMP: campaignCode,
            acquisitionData: JSON.stringify(acquisitionData),
        };

        return `${base}${base.includes('?') ? '&' : '?'}${constructURLQuery(
            params
        )}`;
    }

    return base;
};
