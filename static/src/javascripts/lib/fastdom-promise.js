// @flow
import fastdom from 'fastdom';

const promisify = fdaction => (fn: Function, ctx: ?Object): Promise<any> =>
    new Promise((resolve, reject) =>
        fdaction(
            /* this function needs to be bound to ctx - it therefore cannot
                   be an arrow function as this will be bound with the current
                   context and cannot be rebound.
                */
            function() {
                try {
                    resolve(fn.call(this));
                } catch (e) {
                    reject(e);
                }
            },
            ctx
        )
    );

export default {
    read: promisify(fastdom.read.bind(fastdom)),
    write: promisify(fastdom.write.bind(fastdom)),
    defer: promisify(fastdom.defer.bind(fastdom)),
};
