import { createAuthenticationComponentEventParams } from 'common/modules/identity/auth-component-event-params';

describe('createAuthenticationComponentEventParams', () => {
    it('should create component event params using the component ID passed', () => {
        expect(
            createAuthenticationComponentEventParams('email_sign_in_banner')
        ).toBe(
            'componentEventParams=componentType%3Didentityauthentication%26componentId%3Demail_sign_in_banner'
        );
    });
});
