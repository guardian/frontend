export const postMessage = (
    message,
    targetWindow,
    targetOrigin
) => {
    targetWindow.postMessage(
        JSON.stringify(message),
        targetOrigin || '*'
    );
};
