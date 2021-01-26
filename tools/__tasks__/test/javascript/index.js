const execa = require('execa');
const split = require('split');

require('any-observable/register/rxjs-all');
const Observable = require('any-observable');
const streamToObservable = require('stream-to-observable');

const exec = (cmd, args) => {
    const cp = execa(cmd, args);

    return Observable.merge(
        streamToObservable(cp.stdout.pipe(split()), { await: cp }),
        streamToObservable(cp.stderr.pipe(split()), { await: cp })
    ).filter(Boolean);
};

module.exports = {
    description: 'Test JS app',
    task: [
        {
            description: 'Run tests',
            task: [
                {
                    description: 'JS tests',
                    task: () => exec('jest'),
                },
            ],
            concurrent: true,
        },
    ],
};
