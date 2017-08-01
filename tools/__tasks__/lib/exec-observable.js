const execa = require('execa');
const split = require('split');
// eslint-disable-next-line import/no-unassigned-import
require('any-observable/register/rxjs-all');
const Observable = require('any-observable');
const streamToObservable = require('stream-to-observable');

module.exports = (cmd, args) => {
    const cp = execa(cmd, args);

    return Observable.merge(
        streamToObservable(cp.stdout.pipe(split()), { await: cp }),
        streamToObservable(cp.stderr.pipe(split()), { await: cp })
    ).filter(Boolean);
};
