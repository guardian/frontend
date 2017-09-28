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

export const addTrackingCodesToUrl = ({
    base,
    componentType,
    componentId,
    campaignCode = '',
    abTest,
}: {
    base: string,
    componentType: OphanComponentType,
    componentId: string,
    campaignCode?: string,
    abTest?: { name: string, variant: string },
}) => {
    const acquisitionData = {
        source: 'GUARDIAN_WEB',
        componentId,
        componentType,
        referrerPageviewId: config.get('ophan.pageViewId') || undefined,
        campaignCode,
        abTest,
    };

    const params = {
        REFPVID: config.get('ophan.pageViewId') || 'not_found',
        INTCMP: campaignCode,
        acquisitionData: JSON.stringify(acquisitionData),
    };

    return `${base}${base.includes('?') ? '&' : '?'}${constructURLQuery(
        params
    )}`;
};
