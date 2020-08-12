// @flow
/* eslint-disable no-underscore-dangle */
import config from 'lib/config';
import { shouldUseSourcepointCmp } from 'commercial/modules/cmp/sourcepoint';

if (
    config.get('switches.enableConsentManagementService') &&
    !shouldUseSourcepointCmp()
) {
    try {
        (function stubCMP(document, window) {
            if (!window.__cmp) {
                window.__cmp = (function CMPSetup() {
                    const listen =
                        window.attachEvent || window.addEventListener;
                    listen(
                        'message',
                        event => {
                            window.__cmp.receiveMessage(event);
                        },
                        false
                    );

                    const locatorFrame = document.createElement('iframe');
                    locatorFrame.style.display = 'none';
                    locatorFrame.name = '__cmpLocator';
                    locatorFrame.setAttribute('aria-hidden', 'true');

                    const addLocatorFrame = () => {
                        if (!window.frames.__cmpLocator) {
                            if (document.body !== null) {
                                document.body.appendChild(locatorFrame);
                            } else {
                                setTimeout(addLocatorFrame, 5);
                            }
                        }
                    };
                    addLocatorFrame();

                    const commandQueue = [];
                    const cmp = function CMP(command, parameter, callback) {
                        if (command === 'ping') {
                            if (callback) {
                                callback({
                                    gdprAppliesGlobally: !!(
                                        window.__cmp &&
                                        window.__cmp.config &&
                                        // this isn't actually our config object
                                        // eslint-disable-next-line guardian-frontend/no-direct-access-config
                                        window.__cmp.config.storeConsentGlobally
                                    ),
                                    cmpLoaded: false,
                                });
                            }
                        } else {
                            commandQueue.push({
                                command,
                                parameter,
                                callback,
                            });
                        }
                    };
                    cmp.commandQueue = commandQueue;
                    cmp.receiveMessage = function CMPreceiveMessage(event) {
                        const data =
                            event && event.data && event.data.__cmpCall;
                        if (data) {
                            commandQueue.push({
                                callId: data.callId,
                                command: data.command,
                                parameter: data.parameter,
                                event,
                            });
                        }
                    };
                    cmp.config = {
                        storeConsentGlobally: false,
                        storePublisherData: false,
                        logging: false,
                        gdprApplies: true,
                    };
                    return cmp;
                })();
            }
        })(document, window);
    } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
            throw e;
        }
    }
}
