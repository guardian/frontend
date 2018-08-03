// @flow

import {
    insertAtSubmeta,
    reportEpicError,
    trackEpic,
} from 'common/modules/commercial/epic/epic-utils';

import type { EpicComponent } from 'common/modules/commercial/epic/epic-utils';

// TODO: use flow types for messages in optimize epic channel

// channel for messages between Optimize Epic and Guardian frontend
const OPTIMIZE_EPIC_CHANNEL = 'OPTIMIZE_EPIC';

// messages in this channel (incoming / outgoing) should have the following schema:
// { channel: 'OPTIMIZE_EPIC', messageType: string, data: ?any }

// outgoing event types
const RESIZE_TRIGGERED = 'RESIZE_TRIGGERED';

// incoming event types
const EPIC_INITIALIZED = 'EPIC_INITIALIZED';
const EPIC_HEIGHT = 'EPIC_HEIGHT';

let iframe: HTMLIFrameElement;

// Return type a Promise - presuming fastdom will be required (?)
const createEpicIframe = (url: string): Promise<EpicComponent> => {
    const container = document.createElement('div');
    iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.frameBorder = '0';
    container.appendChild(iframe);
    return Promise.resolve({ html: container });
};

const insertEpicIframe = (epic: EpicComponent): Promise<EpicComponent> =>
    new Promise((resolve, reject) => {
        // adding listener before inserting iframe into the DOM,
        // ensures no messages sent from the iframe will be unhandled
        window.addEventListener('message', (event: MessageEvent) => {
            let message = null;
            try {
                if (typeof event.data === 'string') {
                    message = JSON.parse(event.data);
                }
            } catch (err) {
                return;
            }

            if (!message || message.channel !== OPTIMIZE_EPIC_CHANNEL) {
                return;
            }

            if (message.messageType === EPIC_INITIALIZED) {
                const data = message.data;
                const component = {
                    componentType: 'ACQUISITIONS_EPIC',
                    id: (data && data.componentId) ? data.componentId : 'optimize_epic',
                };

                const abTest = data.abTest;
                const componentEvent = (abTest) ? { component, abTest } : { component };

                resolve({
                    html: epic.html,
                    // with some more work, variant-specific component event data could be sent in the epic initialized message
                    componentEvent,
                });
                return;
            }

            if (message.messageType === EPIC_HEIGHT) {
                iframe.style.height = `${message.data.height}px`; // TODO: px unit ok?
            }
        });

        insertAtSubmeta(epic).catch(reject);
    });

const setIframeHeight = (component: EpicComponent): EpicComponent => {
    // Ok to call this function at this point in the iframe initialisation,
    // since event handler in the iframe will already have been initialised.
    const sendResizeTriggeredMessage = () => {
        iframe.contentWindow.postMessage(
            JSON.stringify({
                channel: OPTIMIZE_EPIC_CHANNEL,
                messageType: RESIZE_TRIGGERED,
            }),
            '*'
        ); // TODO: target origin
    };

    window.addEventListener('resize', sendResizeTriggeredMessage);
    sendResizeTriggeredMessage();
    return component;
};

const displayIframeEpic = (url: string): Promise<EpicComponent> =>
    createEpicIframe(url)
        .then(insertEpicIframe)
        .then(setIframeHeight)
        .then(epic => {
            trackEpic(epic);
            return epic;
        })
        .catch(error => {
            const iframeError = new Error(
                `unable to display iframe epic with url ${url} - ${error}`
            );
            reportEpicError(iframeError);
            return Promise.reject(iframeError);
        });

export { displayIframeEpic };
