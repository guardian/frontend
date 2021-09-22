const timeout = (interval, promise) =>
    Promise.race([
        promise,
        new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error('Timeout')), interval);
        }),
    ]);

export default timeout;
