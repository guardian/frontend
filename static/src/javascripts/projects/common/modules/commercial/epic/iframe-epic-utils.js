// @flow

import config from 'lib/config';
import { getLocalCurrencySymbol } from 'lib/geolocation';
import { constructQuery as constructURLQuery } from 'lib/url';

import {
    insertAtSubmeta,
    reportEpicError,
} from 'common/modules/commercial/epic/epic-utils';
import { getStyles } from 'commercial/modules/messenger/get-stylesheet';

import type { EpicComponent } from 'common/modules/commercial/epic/epic-utils';
import type { ABTestVariant } from 'common/modules/commercial/acquisitions-ophan';

// origin field useful for determining that messages are being sent / received from the expected iframe.
export type IframeEpicComponent = EpicComponent & {
    iframe: HTMLIFrameElement,
    origin: string,
};

type FontName =
    | 'GuardianHeadline'
    | 'GuardianTextEgyptianWeb'
    | 'GuardianTextSansWeb';

// channel for messages between Optimize Epic and Guardian frontend
const OPTIMIZE_EPIC_CHANNEL = 'OPTIMIZE_EPIC';

// messages in this channel (incoming / outgoing) should have the following schema:
// { channel: 'OPTIMIZE_EPIC', messageType: string, data: ?any }

// incoming event types
const EPIC_INITIALIZED = 'EPIC_INITIALIZED';
const EPIC_HEIGHT = 'EPIC_HEIGHT';

// outgoing event types
const FONTS = 'FONTS';

const createEpicIframe = (url: string): Error | IframeEpicComponent => {
    let origin;
    try {
        origin = new URL(url).origin;
    } catch (error) {
        return new Error(`unable to get origin of iframe Epic - ${error}`);
    }

    const container = document.createElement('div');
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.frameBorder = '0';
    container.appendChild(iframe);
    return { html: container, iframe, origin };
};

const setIframeHeight = (epic: IframeEpicComponent, height: number) => {
    epic.iframe.style.height = `${height}px`;
};

const insertEpicIframe = (
    epic: IframeEpicComponent,
    abTestVariant?: ABTestVariant
): Promise<IframeEpicComponent> =>
    new Promise((resolve, reject) => {
        // adding listener before inserting iframe into the DOM,
        // ensures no messages sent from the iframe will be unhandled
        window.addEventListener('message', (event: MessageEvent) => {
            if (event.origin !== epic.origin) {
                return;
            }

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
                            : 'iframe_epic_unknown',
                };

                const abTest = data.abTest || abTestVariant;
                const componentEvent = abTest
                    ? { component, abTest }
                    : { component };

                if (data.height) {
                    setIframeHeight(epic, data.height);
                }

                resolve({
                    html: epic.html,
                    iframe: epic.iframe,
                    origin: epic.origin,
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

const sendFontsToIframe = (
    fonts: Array<FontName>,
    epic: IframeEpicComponent
) => {
    const selector = fonts
        .map(font => `.webfont[data-cache-name="${font}"]`)
        .join(',');
    const fontStyle = getStyles({ selector }, document.styleSheets);

    const message = JSON.stringify({
        channel: OPTIMIZE_EPIC_CHANNEL,
        messageType: FONTS,
        fonts: fontStyle,
    });

    try {
        epic.iframe.contentWindow.postMessage(message, epic.origin);
    } catch (error) {
        reportEpicError(
            new Error(`unable to send fonts to Epic iframe - ${error}`)
        );
    }
};

const addEpicDataToUrl = (url: string): string => {
    const params = constructURLQuery({
        // used in acquisition tracking link
        pvid: config.get('ophan.pageViewId'),
        url: window.location.href.split('?')[0],
        // use to display pricing in local currency
        lcs: getLocalCurrencySymbol(),
    });
    return `${url}?${params}`;
};

type IframeEpicDisplayConfig = {
    url: string,
    sendFonts: boolean,
    abTestVariant?: ABTestVariant,
};

const displayIframeEpic = (
    iframeConfig: IframeEpicDisplayConfig
): Promise<IframeEpicComponent> => {
    const url = addEpicDataToUrl(iframeConfig.url);
    const iframeEpicComponent = createEpicIframe(url);

    if (iframeEpicComponent instanceof Error) {
        return Promise.reject(iframeEpicComponent);
    }

    return insertEpicIframe(iframeEpicComponent, iframeConfig.abTestVariant)
        .then(epic => {
            if (iframeConfig.sendFonts) {
                sendFontsToIframe(
                    [
                        'GuardianHeadline',
                        'GuardianTextEgyptianWeb',
                        'GuardianTextSansWeb',
                    ],
                    epic
                );
            }
            return epic;
        })
        .catch(error => {
            const iframeError = new Error(
                `unable to display iframe epic with url ${url} - ${error}`
            );
            reportEpicError(iframeError);
            return Promise.reject(iframeError);
        });
};

export { displayIframeEpic };
