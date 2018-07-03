// @flow
// eslint disable:no-use-before-define

const format = (t: number) => t.toFixed(0).padStart(2, '0');

const formatTime = (t: number) => {
    const second = Math.floor(t % 60);
    const minute = Math.floor((t % 3600) / 60);
    const hour = Math.floor(t / 3600);
    return hour === 0
        ? `${format(minute)}:${format(second)}`
        : `${format(hour)}:${format(minute)}:${format(second)}`;
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

export { format, formatTime, range };
