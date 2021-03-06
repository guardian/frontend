/**
 * DO NOT EDIT THIS FILE
 *
 * It is not used to to build anything.
 *
 * It's just a record of the old flow types.
 *
 * Use it as a guide when converting
 * - static/src/javascripts/projects/commercial/modules/dfp/breakpoint-name-to-attribute.js
 * to .ts, then delete it.
 */

// @flow

const breakpointNameToAttribute = (breakpointName: string): string =>
    breakpointName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

export { breakpointNameToAttribute };
