// @flow
// eslint disable:no-use-before-define

import ophan from 'ophan/ng';

const format = (t: number) => t.toFixed(0).padStart(2, '0');

const formatTime = (t: number) => {
    const second = Math.floor(t % 60);
    const minute = Math.floor((t % 3600) / 60);
    const hour = Math.floor(t / 3600);
    return `${format(hour)}:${format(minute)}:${format(second)}`;
};

const range = (min: number, max: number) => {
    const ret = [];
    let x = min;
    while (x < max) {
        ret.push(x);
        x += 1;
    }
    return ret;
};

const sendToOphan = (id: string, eventName: string) => {
    ophan.record({
        audio: {
            id,
            eventType: `audio:content:${eventName}`,
        },
    });
};

const checkForTimeEvents = (id: string, percent: number) => {
    if (percent === 25) {
        sendToOphan(id, '25');
    } else if (percent === 50) {
        sendToOphan(id, '50');
    } else if (percent === 75) {
        sendToOphan(id, '75');
    } else if (percent === 100) {
        sendToOphan(id, 'end');
    }
};

export { format, formatTime, range, sendToOphan, checkForTimeEvents };
