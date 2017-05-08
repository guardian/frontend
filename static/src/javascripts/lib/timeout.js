// @flow

const timeout = (interval: number, promise: Promise<any>): Promise<any> =>
    Promise.race([
        promise,
        new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error('Timeout')), interval);
        }),
    ]);

export default timeout;
