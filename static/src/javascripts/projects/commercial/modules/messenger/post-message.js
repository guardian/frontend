// @flow
import dfpOrigin from 'commercial/modules/messenger/dfp-origin';

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
