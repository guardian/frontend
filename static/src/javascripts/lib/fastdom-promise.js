// @flow
import fastdom from 'fastdom';

const promisify = fdaction => (fn: Function, ctx: ?Object) =>
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
    measure: promisify(fastdom.measure.bind(fastdom)),
    mutate: promisify(fastdom.mutate.bind(fastdom)),
};
