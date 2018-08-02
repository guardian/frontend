// @flow

import {
    insertAtSubmeta,
    reportEpicError,
} from 'common/modules/commercial/epic/epic-utils';

import type { EpicComponent } from 'common/modules/commercial/epic/epic-utils';

// TODO: fix hack - should be passed along
let iframe: HTMLIFrameElement;

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

const insertEpicIframe = (component: EpicComponent): Promise<EpicComponent> => new Promise((resolve, reject) => {

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
            resolve(component);
            return;
        }

        if (message.messageType === EPIC_HEIGHT) {
            console.log('setting height', message.data.height);
            iframe.style.height = `${message.data.height}px`;
        }
    });

    insertAtSubmeta(component).catch(reject);
});

const setIframeHeight = (component: EpicComponent): EpicComponent => {

    const sendResizeTriggeredMessage = () => {
        // setIframeHeight should be called once the iframe has been inserted.
        // This means the Optimize Epic will have been initialized.
        // In particular, handlers will be set up for message events in the Optimize Epic channel.
        iframe.contentWindow.postMessage(JSON.stringify({
            channel: OPTIMIZE_EPIC_CHANNEL,
            messageType: RESIZE_TRIGGERED,
        }), '*'); // TODO: target origin
    };

    window.addEventListener('resize', sendResizeTriggeredMessage);
    sendResizeTriggeredMessage();
    return component;
};

const displayEpicIframe = (url: string): Promise<EpicComponent> =>
    createEpicIframe(url).then(insertEpicIframe).then(setIframeHeight);

const getOptimizeEpicUrl = (): ?string =>
    'http://reader-revenue-components.s3-website-eu-west-1.amazonaws.com/epic/v1/index.html';
    // 'https://support.code.dev-theguardian.com/epic/v1/index.html';

const displayOptimizeEpic = (): Promise<EpicComponent> => {
    const url = getOptimizeEpicUrl();
    if (!url) {
        return Promise.reject(
            new Error('unable to get default optimize epic url')
        );
    }
    return displayEpicIframe(url).catch(err => {
        reportEpicError(err);
        throw err;
    });
};

export { displayOptimizeEpic };
