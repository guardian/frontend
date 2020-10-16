@()

const postMessages = (msg) => {
    const targetDomains = [
        "https://theguardian.com",
        "file://theguardian.com",
        "https://m.thegulocal.com/",
        "https://m.code.dev-theguardian.com",
    ]
    targetDomains.forEach((target) => {
        console.log(`*** Sending to ${target}`)
        console.log(JSON.stringify(msg))
        window.parent.postMessage(msg, target)
    })
}
const sendEvent = (payload, eventType) => {
    const msg = {
        id: 'xxxxxxxxxx'.replace(/x/g, () =>
            // eslint-disable-next-line no-bitwise
            ((Math.random() * 36) | 0).toString(36)
        ),
        type: `ophan-iframe-${eventType}`,
        iframeId: window.frameElement ? window.frameElement.id : null,
        value: payload,
    };
    postMessages(msg);
    return msg.id;
};

const getClickEvent = (el) => {
    return {
        clickComponent: el.getAttribute('data-component'), clickLinkNames: [el.getAttribute('data-link-name')]
    }
}


const trackClickEvent = (el) => {
    el.addEventListener('click', (event) => {
        const clickEvent = getClickEvent(el)
        sendEvent(clickEvent, 'click-event')
    })
}

