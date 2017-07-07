// @flow
import { send } from 'commercial/modules/messenger/send';

/** Allows cross-frame communication with in-app articles */
const comready = (resolve: (?any) => void, reject: (?any) => void) => {
    const MAX_COUNT = 5;
    let count = 0;
    send('syn', true);
    const intId = setInterval(() => {
        count += 1;
        if (count === MAX_COUNT) {
            clearInterval(intId);
            reject(new Error('Failed to reach page messenger'));
        }
        send('syn', true);
    }, 500);
    window.addEventListener('message', evt => {
        const response = JSON.parse(evt.data);
        if (
            typeof response !== 'object' ||
            typeof response.result !== 'object' ||
            response.result.msg !== 'ack'
        ) {
            return;
        }
        clearInterval(intId);
        resolve(response.result);
    });
};

export { comready };
