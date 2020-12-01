import { constructQuery } from '../../../../lib/url';

export type AuthenticationComponentId =
    | 'email_sign_in_banner'
    | 'subscription_sign_in_banner'
    | 'guardian_smartlock'
    | 'signin_from_formstack';

export const createAuthenticationComponentEvent = (
    componentId: AuthenticationComponentId,
    pageViewId?: string
) => {
    const params: Object = {
        componentType: 'identityauthentication',
        componentId,
    };

    if (pageViewId) {
        params.viewId = pageViewId;
    }

    return constructQuery(params);
};

export const createAuthenticationComponentEventParams = (
    componentId: AuthenticationComponentId,
    pageViewId?: string
) =>
    `componentEventParams=${encodeURIComponent(
        createAuthenticationComponentEvent(componentId, pageViewId)
    )}`;
