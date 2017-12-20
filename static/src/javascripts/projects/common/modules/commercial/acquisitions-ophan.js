// @flow
import ophan from 'ophan/ng';
import config from 'lib/config';
import { constructQuery as constructURLQuery } from 'lib/url';

type ComponentEventWithoutAction = {
    component: OphanComponent,
    value?: string,
    id?: string,
    abTest?: {
        name: string,
        variant: string,
    },
};

type AcquisitionLinkParams = {
    base: string,
    componentType: OphanComponentType,
    componentId: string,
    campaignCode?: string,
    abTest?: { name: string, variant: string },
    geolocation?: string,
};

export const submitComponentEvent = (componentEvent: OphanComponentEvent) => {
    ophan.record({ componentEvent });
};

export const submitInsertEvent = (
    componentEvent: ComponentEventWithoutAction
) =>
    submitComponentEvent({
        ...componentEvent,
        action: 'INSERT',
    });

export const submitViewEvent = (componentEvent: ComponentEventWithoutAction) =>
    submitComponentEvent({
        ...componentEvent,
        action: 'VIEW',
    });

export const addReferrerData = (acquisitionData: {}): {} =>
    // Note: the current page is the referrer data in the context of the acquisition.
    ({
        ...acquisitionData,
        referrerPageviewId: config.get('ophan.pageViewId'),
        referrerUrl: window.location.href.split('?')[0],
    });

export const addTrackingCodesToUrl = ({
    base,
    componentType,
    componentId,
    campaignCode,
    abTest,
    geolocation,
}: AcquisitionLinkParams) => {
    const acquisitionData = addReferrerData({
        source: 'GUARDIAN_WEB',
        componentId,
        componentType,
        campaignCode,
        abTest,
    });

    const params: {
        REFPVID: string,
        INTCMP?: string,
        acquisitionData: string,
        bundle?: string,
    } = {
        REFPVID: config.get('ophan.pageViewId') || 'not_found',
        INTCMP: campaignCode,
        acquisitionData: JSON.stringify(acquisitionData),
    };

    if (geolocation === 'GB' && componentType === 'ACQUISITIONS_EPIC') {
        params.bundle = 'contribute';
    }

    return `${base}${base.includes('?') ? '&' : '?'}${constructURLQuery(
        params
    )}`;
};
