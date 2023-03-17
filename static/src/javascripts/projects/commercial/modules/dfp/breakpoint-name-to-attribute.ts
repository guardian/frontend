/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

// Regex to match a lowercase letter followed by an uppercase letter
const regex = /([a-z])([A-Z])/g;

/** Convert a breakpoint name to a form suitable for use as an attribute
 *
 * e.g. `mobileLandscape` => `mobile-landscape`
 */
const breakpointNameToAttribute = (breakpointName: string): string =>
	breakpointName.replace(regex, '$1-$2').toLowerCase();

export { breakpointNameToAttribute };
