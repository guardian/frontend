const regex = /([a-z])([A-Z])/g;

const breakpointNameToAttribute = (breakpointName: string): string =>
	breakpointName.replace(regex, '$1-$2').toLowerCase();

export { breakpointNameToAttribute };
