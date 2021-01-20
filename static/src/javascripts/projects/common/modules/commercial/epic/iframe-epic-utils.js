import config from 'lib/config';
import { getLocalCurrencySymbolSync } from 'lib/geolocation';
import { constructQuery as constructURLQuery } from 'lib/url';

import {
    insertAtSubmeta,
    reportEpicError,
} from 'common/modules/commercial/epic/epic-utils';

import { submitComponentEvent } from 'common/modules/commercial/acquisitions-ophan';

// origin field useful for determining that messages are being sent / received from the expected iframe.

// channel for messages between Optimize Epic and Guardian frontend
const OPTIMIZE_EPIC_CHANNEL = 'OPTIMIZE_EPIC';

// messages in this channel (incoming / outgoing) should have the following schema:
// { channel: 'OPTIMIZE_EPIC', messageType: string, data: ?any }

// incoming event types
const EPIC_INITIALIZED = 'EPIC_INITIALIZED';
const EPIC_HEIGHT = 'EPIC_HEIGHT';

const createEpicIframe = (url) => {
    let origin;
    try {
        origin = new URL(url).origin;
    } catch (error) {
        const iframeError = new Error(
            `unable to get origin of iframe Epic - ${error}`
        );
        reportEpicError(iframeError);
        return iframeError;
    }

    const container = document.createElement('div');
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.height = '525px';
    iframe.frameBorder = '0';
    container.appendChild(iframe);
    // hard coded for test purposes
    return {
        html: container,
        iframe,
        origin,
        componentEvent: {
            component: {
                componentType: 'ACQUISITIONS_EPIC',
                id: 'iframe_control_epic_v2',
            },
            abTest: {
                name: 'iframe_or_not_v2',
                variant: 'iframe',
            },
        },
    };
};

const setIframeHeight = (epic, height) => {
    epic.iframe.style.height = `${height}px`;
};

const setupListener = (epic) => {
    window.addEventListener('message', (event) => {
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
            if (data.height) {
                setIframeHeight(epic, data.height);
            }

            // Track that we got a message out of the iframe
            submitComponentEvent({
                action: 'ANSWER',
                component: {
                    componentType: 'ACQUISITIONS_EPIC',
                },
                value: JSON.stringify(message),
            });

            return;
        }

        if (message.messageType === EPIC_HEIGHT && data.height) {
            setIframeHeight(epic, data.height);
        }
    });
};

const addEpicDataToUrl = (url) => {
    const params = constructURLQuery({
        // used in acquisition tracking link
        pvid: config.get('ophan.pageViewId'),
        url: window.location.href.split('?')[0],
        // use to display pricing in local currency
        lcs: getLocalCurrencySymbolSync(),
    });
    return `${url}?${params}`;
};

const displayIframeEpic = (url) => {
    const iframeEpicComponent = createEpicIframe(addEpicDataToUrl(url));

    if (iframeEpicComponent instanceof Error) {
        reportEpicError(iframeEpicComponent);
        return Promise.reject(iframeEpicComponent);
    }

    setupListener(iframeEpicComponent);

    return insertAtSubmeta(iframeEpicComponent)
        .then(() => iframeEpicComponent)
        .catch(error => {
            const iframeError = new Error(
                `unable to display iframe epic with url ${url} - ${error}`
            );
            reportEpicError(iframeError);
            return Promise.reject(iframeError);
        });
};

export { displayIframeEpic };
