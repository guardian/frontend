// @flow

const breakpointNameToAttribute = (breakpointName: string): string =>
    breakpointName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

export { breakpointNameToAttribute };
