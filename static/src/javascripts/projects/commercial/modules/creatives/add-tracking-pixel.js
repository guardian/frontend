// @flow
const addTrackingPixel = (url: string): string => (new Image().src = url);

export { addTrackingPixel };
