// @flow

interface EventPayload {
    eventType: string
}

interface ClickEventPayload extends EventPayload {
    event: MouseEvent
}

const sendEvent = (payload: EventPayload | ClickEventPayload): string => {
    const msg = {
        id: 'xxxxxxxxxx'.replace(/x/g, () =>
            // eslint-disable-next-line no-bitwise
            ((Math.random() * 36) | 0).toString(36)
        ),
        type: 'iframe-event',
        iframeId: window.name,
        value: payload,
    };

    window.top.postMessage(JSON.stringify(msg), '*');

    return msg.id;
};

export const trackClickEvent = (el: HTMLElement): void => {

    el.addEventListener('click', (eventListener: MouseEvent) => {
        sendEvent({eventType: 'click', event: eventListener})
    })
}
