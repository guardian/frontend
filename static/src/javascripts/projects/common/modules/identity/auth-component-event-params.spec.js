// @flow

import { createAuthenticationComponentEventParams } from "common/modules/identity/auth-component-event-params";

describe('createAuthenticationComponentEventParams', () => {
    it('should create component event params using the component ID passed', () => {
        expect(createAuthenticationComponentEventParams('some-component-id')).toBe('componentEventParams=componentType%3DIDENTITY_AUTHENTICATION%26componentId%3Dsome-component-id')
    })
});
