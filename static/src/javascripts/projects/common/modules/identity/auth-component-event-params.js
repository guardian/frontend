// @flow
import {constructQuery} from "../../../../lib/url";

export const createAuthenticationComponentEventParams = (componentId: string) =>
    `componentEventParams=${encodeURIComponent(
        constructQuery({
            componentType: 'IDENTITY_AUTHENTICATION',
            componentId
        })
    )}`;

