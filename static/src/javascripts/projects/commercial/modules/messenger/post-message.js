// @flow

export const postMessage = (
    message: {},
    targetWindow: WindowProxy,
    targetOrigin: ?string
): void => {
    targetWindow.postMessage(
        JSON.stringify(message),
        targetOrigin || '*'
    );
};
