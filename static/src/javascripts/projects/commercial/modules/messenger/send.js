// @flow
import post from 'commercial/modules/messenger/post-message';

/* eslint no-bitwise: "off" */

const send = (type: string, payload: any): string => {
    const msg = {
        id: 'xxxxxxxxxx'.replace(/x/g, () =>
            ((Math.random() * 36) | 0).toString(36)
        ),
        iframeId: window.name,
        type,
        value: payload,
    };

    post(msg, window.top, '*');

    return msg.id;
};

export { send };
