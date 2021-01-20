const breakpointNameToAttribute = (breakpointName) =>
    breakpointName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

export { breakpointNameToAttribute };
