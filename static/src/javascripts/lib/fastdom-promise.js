// @flow
import fastdom from 'fastdom';

const promisify = fdaction =>
    (fn: Function, ctx: Object) =>
        new Promise((resolve, reject) =>
            fdaction(
                () => {
                    try {
                        resolve(fn.call(this));
                    } catch (e) {
                        reject(e);
                    }
                },
                ctx
            ));

export default {
    read: promisify(fastdom.read.bind(fastdom)),
    write: promisify(fastdom.write.bind(fastdom)),
};
