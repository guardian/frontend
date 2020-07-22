@()

const sendEvent = (payload) => {
    const msg = {
        id: 'xxxxxxxxxx'.replace(/x/g, () =>
            // eslint-disable-next-line no-bitwise
            ((Math.random() * 36) | 0).toString(36)
        ),
        type: 'newsletter-subscription-event',
        iframeId: window.frameElement.id,
        value: payload,
    };
    window.parent.postMessage(msg, '*');
    return msg.id;
};

const getClickEvent = (el) => {
    return {
        clickComponent: el.getAttribute('data-component'), clickLinkNames: [el.getAttribute('data-link-name')]
    }
}


const trackClickEvent = (el) => {
    console.log("*** Adding click event to ", el)
    el.addEventListener('click', (event) => {
        const clickEvent = getClickEvent(el)
        sendEvent(clickEvent)
    })
}

// Below need to be added to the top window somewhere.

const handleIframeMessage = (messageEvent) => {
    if (messageEvent.data.type === 'newsletter-subscription-event') {
        const clickEvent = messageEvent.data.value
        const iFrame = document.getElementById(messageEvent.data.iframeId)
        clickEvent.clickLinkNames = getDataLinkNames(iFrame, clickEvent.clickLinkNames) || clickEvent.clickLinkNames
        console.log("*** clickEvent: ", clickEvent)
        window.guardian.ophan.record(clickEvent)
    }
}

const getDataLinkNames = (el, dataLinkNames) => {
    const isBody = (elem) => elem && elem.nodeName && elem.nodeName.toLowerCase()  === window.top.document.body.nodeName.toLowerCase()

    const isDocument = (elem) => elem === window.document

    const walkTree = (elem, dataLinkNames = []) => {
        if (elem && !isBody(elem) && !isDocument(elem)) {
            const dataLinkName = elem.getAttribute("data-link-name")
            if (dataLinkName) {
                dataLinkNames.push(dataLinkName)
            }
            return walkTree(elem.parentNode, dataLinkNames)
        } else {
            return dataLinkNames
        }

    }

    return walkTree(el, dataLinkNames)
}

window.top.addEventListener('message', handleIframeMessage, false)
