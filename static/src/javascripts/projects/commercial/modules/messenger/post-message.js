import dfpOrigin from 'commercial/modules/messenger/dfp-origin';
export default postMessage;

function postMessage(message, targetWindow, targetOrigin) {
    targetWindow.postMessage(JSON.stringify(message), targetOrigin || dfpOrigin);
}
