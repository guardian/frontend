// @flow

import { constructQuery as constructURLQuery } from 'lib/url';
import config from 'lib/config';

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

const insertEpicIframe = (component: EpicComponent): Promise<EpicComponent> =>
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
                resolve({
                    html: component.html,
                    // with some more work, variant-specific component event data could be sent in the epic initialized message
                    componentEvent: {
                        component: {
                            componentType: 'ACQUISITIONS_EPIC',
                            id: 'optimize_epic',
                        },
                    },
                });
                return;
            }

            if (message.messageType === EPIC_HEIGHT) {
                iframe.style.height = `${message.data.height}px`; // TODO: px unit ok?
            }
        });

        insertAtSubmeta(component).catch(reject);
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

const displayEpicIframe = (url: string): Promise<EpicComponent> =>
    createEpicIframe(url)
        .then(insertEpicIframe)
        .then(setIframeHeight)
        .then(epic => {
            trackEpic(epic);
            return epic;
        });

const getOptimizeEpicUrl = (): string => {
    const url =
        config.get('page.optimizeEpicUrl') ||
        // FIXME
        'http://reader-revenue-components.s3-website-eu-west-1.amazonaws.com/epic/v1/index.html';
    // data passed in query string used to augment acquisition tracking link in iframe
    const params = constructURLQuery({
        pvid: config.get('ophan.pageViewId'),
        url: window.location.href.split('?')[0],
    });
    return `${url}?${params}`;
};

const displayOptimizeEpic = (): Promise<EpicComponent> => {
    const url = getOptimizeEpicUrl();
    return displayEpicIframe(url).catch(err => {
        reportEpicError(err);
        throw err;
    });
};

export { displayOptimizeEpic };
