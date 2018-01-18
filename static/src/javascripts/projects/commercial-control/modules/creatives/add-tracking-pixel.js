// @flow
const addTrackingPixel = (url: string): void => {
    new Image().src = url;
};

export { addTrackingPixel };
