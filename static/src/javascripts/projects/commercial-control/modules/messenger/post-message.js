// @flow
import dfpOrigin from 'commercial-control/modules/messenger/dfp-origin';

export const postMessage = (
    message: {},
    targetWindow: WindowProxy,
    targetOrigin: ?string
): void => {
    targetWindow.postMessage(
        JSON.stringify(message),
        targetOrigin || dfpOrigin
    );
};
