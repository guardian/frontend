// @flow

import {
    insertAtSubmeta,
    reportEpicError,
    trackEpic,
} from 'common/modules/commercial/epic/epic-utils';
import { getStyles } from 'commercial/modules/messenger/get-stylesheet';

import type { EpicComponent } from 'common/modules/commercial/epic/epic-utils';

export type IframeEpicComponent = EpicComponent & { iframe: HTMLIFrameElement };
type FontName = 'GuardianHeadline' | 'GuardianTextEgyptianWeb' | 'GuardianTextSansWeb';

// TODO: use flow types for messages in optimize epic channel

// channel for messages between Optimize Epic and Guardian frontend
const OPTIMIZE_EPIC_CHANNEL = 'OPTIMIZE_EPIC';

// messages in this channel (incoming / outgoing) should have the following schema:
// { channel: 'OPTIMIZE_EPIC', messageType: string, data: ?any }

// incoming event types
const EPIC_INITIALIZED = 'EPIC_INITIALIZED';
const EPIC_HEIGHT = 'EPIC_HEIGHT';

// outgoing event types
const FONTS = 'FONTS';

// Return type a Promise - presuming fastdom will be required (?)
const createEpicIframe = (url: string): Promise<IframeEpicComponent> => {
    const container = document.createElement('div');
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.frameBorder = '0';
    container.appendChild(iframe);
    return Promise.resolve({ html: container, iframe });
};

const setIframeHeight = (epic: IframeEpicComponent, height: number) => {
    epic.iframe.style.height = `${height}px`; // TODO: px unit ok?
};

const insertEpicIframe = (
    epic: IframeEpicComponent
): Promise<IframeEpicComponent> =>
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

            const data = message.data;

            if (message.messageType === EPIC_INITIALIZED) {
                const component = {
                    componentType: 'ACQUISITIONS_EPIC',
                    id:
                        data && data.componentId
                            ? data.componentId
                            : 'optimize_epic',
                };

                const abTest = data.abTest;
                const componentEvent = abTest
                    ? { component, abTest }
                    : { component };

                if (data.height) {
                    setIframeHeight(epic, data.height);
                }

                resolve({
                    html: epic.html,
                    iframe: epic.iframe,
                    // with some more work, variant-specific component event data could be sent in the epic initialized message
                    componentEvent,
                });
                return;
            }

            if (message.messageType === EPIC_HEIGHT && data.height) {
                setIframeHeight(epic, data.height);
            }
        });

        insertAtSubmeta(epic).catch(reject);
    });

const sendFontsToIframe = (fonts: Array<FontName>, iframe: HTMLIFrameElement) => {
    const selector = fonts.map(font => `.webfont[data-cache-name="${font}"]`).join(',');
    const fontStyle = getStyles({selector}, document.styleSheets);

    const message = JSON.stringify({
        channel: OPTIMIZE_EPIC_CHANNEL,
        messageType: FONTS,
        fonts: fontStyle
    });

    iframe.contentWindow.postMessage(message, '*');
};

const displayIframeEpic = (url: string): Promise<IframeEpicComponent> =>
    createEpicIframe(url)
        .then(insertEpicIframe)
        .then(epic => {
            sendFontsToIframe(['GuardianHeadline', 'GuardianTextEgyptianWeb', 'GuardianTextSansWeb'], epic.iframe);
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
