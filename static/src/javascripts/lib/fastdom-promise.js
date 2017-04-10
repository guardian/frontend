import fastdom from 'fastdom';
import Promise from 'Promise';

function promisify(fdaction) {
    return (fn, ctx) => new Promise((resolve, reject) => {
        fdaction(function() {
            try {
                resolve(fn.call(this));
            } catch (e) {
                reject(e);
            }
        }, ctx);
    });
}

export default {
    read: promisify(fastdom.read.bind(fastdom)),
    write: promisify(fastdom.write.bind(fastdom))
};
