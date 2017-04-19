// @flow

/**
 * Mockable proxy for window.location
 */
const getHash = (): string => window.location.hash;

export { getHash };
