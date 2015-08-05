import Promise from 'Promise';

export default function (fn, time) {
    var bouncedTimeoutID,
        fnID = 0,
        bounced;

    bounced = function (...args) {
        return new Promise((resolve, reject) => {
            clearTimeout(bouncedTimeoutID);
            let id = ++fnID;
            bouncedTimeoutID = setTimeout(() => {
                Promise.resolve(fn(...args))
                    .then(result => {
                        if (id === fnID) {
                            resolve(result);
                        }
                    })
                    .catch(err => {
                        if (id === fnID) {
                            reject(err);
                        }
                    });
            }, time);
        });
    };

    bounced.dispose = function () {
        clearTimeout(bouncedTimeoutID);
    };

    return bounced;
}
