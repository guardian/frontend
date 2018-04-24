// @flow

const show = (): void => {
    console.log('*** SHOW BREAKING NEWS ***');
};

const canShow = (): Promise<boolean> =>
    new Promise(resolve => {
        setTimeout(() => {
            resolve(true);
        }, 2000);
    });

export default {
    show,
    canShow,
};
