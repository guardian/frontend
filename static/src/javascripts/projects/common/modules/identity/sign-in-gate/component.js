// @flow

// component name, should always be sign-in-gate
export const componentName = 'sign-in-gate';

// set the ophan component tracking vars
export const withComponentId: (id: string) => OphanComponent = (
    id: string = ''
) => ({
    componentType: 'SIGN_IN_GATE',
    id,
});
