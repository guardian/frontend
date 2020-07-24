// @flow
import {constructQuery} from "../../../../lib/url";

export type AuthenticationComponentId = 'email_sign_in_banner' | 'subscription_sign_in_banner' | 'guardian_smartlock' | 'signin_from_formstack'

export const createAuthenticationComponentEvent = (componentId: AuthenticationComponentId, pageViewId?: string) => {
    const params: Object = {
        componentType: 'IDENTITY_AUTHENTICATION',
        componentId,
    };

    if (pageViewId) {
        params.viewId = pageViewId;
    }

    return encodeURIComponent(constructQuery(params));
};

export const createAuthenticationComponentEventParams = (componentId: AuthenticationComponentId, pageViewId?: string) => `componentEventParams=${createAuthenticationComponentEvent(componentId, pageViewId)}`;
